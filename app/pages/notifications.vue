<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Thông báo
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">
        Cập nhật tin tức và hoạt động mới nhất.
      </p>
    </div>

    <!-- Notification List -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div v-if="notifications.length > 0" class="divide-y divide-gray-100 dark:divide-gray-800">
        <div 
          v-for="notif in notifications" 
          :key="notif.id"
          @click="handleClick(notif)"
          class="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
          :class="{'bg-primary-50/30 dark:bg-primary-900/10': !notif.read}"
        >
          <div class="flex gap-4">
            <!-- Icon/Status -->
            <div class="flex-shrink-0 mt-1">
              <div 
                class="w-3 h-3 rounded-full mt-1.5"
                :class="notif.read ? 'bg-transparent border border-gray-300 dark:border-gray-600' : 'bg-primary-500 ring-4 ring-primary-50 dark:ring-primary-900/30'"
              ></div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
               <div class="flex justify-between items-start gap-4">
                  <h4 class="text-base font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {{ notif.title }}
                  </h4>
                  <span class="text-xs font-medium text-gray-400 whitespace-nowrap bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                    {{ notif.time }}
                  </span>
               </div>
               <p class="text-gray-600 dark:text-gray-300 mt-1">
                 {{ notif.description }}
               </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-12 text-center">
        <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-bell-slash" class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white">Không có thông báo</h3>
        <p class="text-gray-500 mt-1">Bạn chưa có thông báo nào mới.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'app'
})

useHead({
  title: 'Thông báo - SheetVN'
})


// Logic
interface Notification {
  id: string
  title: string
  description: string
  time: string
  link?: string
  read: boolean
  created_at: string
}

const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'Vừa xong'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} phút trước`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} ngày trước`
    return date.toLocaleDateString('vi-VN')
}

const { data: rawNotifications, refresh } = await useFetch<Notification[]>('/api/notifications', {
  key: 'notifications-page'
})

const notifications = computed(() => {
  if (!rawNotifications.value) return []
  return rawNotifications.value.map((n: any) => ({
    ...n,
    time: timeAgo(n.created_at)
  }))
})

const handleClick = async (notif: Notification) => {
    if (!notif.read) {
        // Optimistic
        if (rawNotifications.value) {
            const idx = rawNotifications.value.findIndex((n: any) => n.id === notif.id)
            if (idx !== -1 && rawNotifications.value[idx]) rawNotifications.value[idx].read = true
        }
        await $fetch('/api/notifications/mark-read', { method: 'POST', body: { id: notif.id } })
    }
    if (notif.link) {
        navigateTo(notif.link)
    }
}

</script>
