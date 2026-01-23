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

// Mock Data (Shared with Header for consistent demo)
const notifications = ref([
  { id: 1, title: 'Nhiệm vụ mới', description: 'Bạn được phân công nhiệm vụ "Thiết kế Mobile App"', time: '5 phút trước', read: false },
  { id: 2, title: 'Cập nhật hệ thống', description: 'Hệ thống đã được cập nhật lên phiên bản 2.0. Các tính năng mới bao gồm Dark Mode và cải thiện hiệu suất.', time: '1 giờ trước', read: true },
  { id: 3, title: 'Nhắc nhở họp', description: 'Cuộc họp team Marketing bắt đầu lúc 14:00 tại phòng họp chính.', time: '3 giờ trước', read: true },
  { id: 4, title: 'Thanh toán thành công', description: 'Gói Premium của bạn đã được gia hạn thành công. Hóa đơn đã được gửi về email.', time: '1 ngày trước', read: true },
  { id: 5, title: 'Chào mừng thành viên mới', description: 'Chào mừng Nguyễn Văn A đã gia nhập team Design!', time: '2 ngày trước', read: true },
])
</script>
