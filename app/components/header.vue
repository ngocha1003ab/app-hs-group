<template>
  <header class="h-20 flex items-center justify-between px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 md:relative z-30">
    <!-- Mobile Brand -->
    <div class="md:hidden flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-lg">
      <UIcon name="i-heroicons-squares-2x2" class="w-7 h-7"/>
      <span>SheetVN</span>
    </div>

    <!-- Desktop Title / Breadcrumbs (Placeholder) -->
    <div class="hidden md:flex items-center gap-4">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200">
        Dashboard
      </h2>
    </div>

    <!-- Right Actions -->
    <div class="flex items-center gap-2 md:gap-4">
      <!-- Mobile Menu Dropdown (for additional items) -->
      <div class="md:hidden relative" ref="dropdownContainer">
        <button
          @click="toggleDropdown"
          class="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors inline-flex items-center justify-center"
        >
          <UIcon name="i-heroicons-squares-2x2" class="w-6 h-6" />
        </button>
        
        <!-- Dropdown Menu -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="transform opacity-0 scale-95 translate-y-2"
          enter-to-class="transform opacity-100 scale-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="transform opacity-100 scale-100 translate-y-0"
          leave-to-class="transform opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="isDropdownOpen"
            class="absolute right-0 mt-3 w-64 rounded-xl shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
          >
            <div class="p-2 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 pb-1 uppercase tracking-wider">
                Menu mở rộng
              </p>
            </div>
            <div class="p-1.5 space-y-0.5">
              <NuxtLink 
                to="/progress"
                @click="closeDropdown"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all group"
              >
                <div class="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md group-hover:bg-white dark:group-hover:bg-gray-700 shadow-sm transition-colors">
                  <UIcon name="i-heroicons-chart-pie" class="w-5 h-5 text-gray-500 group-hover:text-primary-500 transition-colors" />
                </div>
                <span>Tiến độ</span>
              </NuxtLink>
              <NuxtLink 
                to="/tasks"
                @click="closeDropdown"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all group"
              >
                <div class="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md group-hover:bg-white dark:group-hover:bg-gray-700 shadow-sm transition-colors">
                  <UIcon name="i-heroicons-clipboard-document-list" class="w-5 h-5 text-gray-500 group-hover:text-primary-500 transition-colors" />
                </div>
                <span>Nhiệm vụ</span>
              </NuxtLink>
              <NuxtLink 
                to="/settings"
                @click="closeDropdown"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all group"
              >
                <div class="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-md group-hover:bg-white dark:group-hover:bg-gray-700 shadow-sm transition-colors">
                  <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5 text-gray-500 group-hover:text-primary-500 transition-colors" />
                </div>
                <span>Cài đặt</span>
              </NuxtLink>
            </div>
          </div>
        </Transition>
      </div>
      
      <!-- Notification Button -->
      <div class="relative" ref="notificationContainer">
        <UButton 
          color="neutral" 
          variant="ghost" 
          icon="i-heroicons-bell" 
          class="text-gray-500 dark:text-gray-400 relative"
          @click="toggleNotifications"
        >
          <span v-if="unreadCount > 0" class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900"></span>
        </UButton>

        <!-- Notification Dropdown -->
        <Transition
          enter-active-class="transition ease-out duration-200"
          enter-from-class="transform opacity-0 scale-95 translate-y-2"
          enter-to-class="transform opacity-100 scale-100 translate-y-0"
          leave-active-class="transition ease-in duration-150"
          leave-from-class="transform opacity-100 scale-100 translate-y-0"
          leave-to-class="transform opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="isNotificationsOpen"
            class="absolute right-0 mt-3 w-80 md:w-96 rounded-xl shadow-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
          >
            <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h3 class="font-semibold text-gray-900 dark:text-white text-sm">Thông báo</h3>
              <span v-if="unreadCount > 0" class="text-xs font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full">
                {{ unreadCount }} mới
              </span>
            </div>
            
            <div class="max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div v-if="notifications.length === 0" class="px-4 py-8 text-center">
                <p class="text-sm text-gray-500 dark:text-gray-400">Không có thông báo nào</p>
              </div>
              
              <div 
                v-for="notif in notifications" 
                :key="notif.id"
                class="px-4 py-3 border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors relative group"
              >
                <div class="flex gap-3">
                  <div class="flex-shrink-0 mt-1">
                    <div class="w-2 h-2 rounded-full" :class="notif.read ? 'bg-transparent' : 'bg-primary-500'"></div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate pr-4">
                      {{ notif.title }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                       {{ notif.description }}
                    </p>
                    <p class="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                      <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                      {{ notif.time }}
                    </p>
                  </div>
                </div>
              </div>
              
              <div class="p-2 text-center bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                <NuxtLink 
                  to="/notifications"
                  @click="closeNotifications"
                  class="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors block w-full"
                >
                  Xem tất cả
                </NuxtLink>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      
      <div class="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
      
      <div class="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <UAvatar 
          :src="userInfo.avatar" 
          :alt="userInfo.name" 
          size="sm"
        />
        <div class="hidden md:flex flex-col items-start pr-2">
           <span class="text-sm font-medium text-gray-700 dark:text-gray-200 leading-tight">
             {{ userInfo.name }}
           </span>
           <span class="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
             {{ userInfo.role === 'Leader' ? 'Trưởng nhóm' : (userInfo.role === 'Member' ? 'Nhân viên' : 'Admin') }}
           </span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const isDropdownOpen = ref(false)
const dropdownContainer = ref<HTMLElement | null>(null)

const userInfo = ref({
   name: '',
   role: '',
   avatar: ''
})

// Fetch User Info
const { data: authData } = await useFetch<any>('/api/auth/me')
if(authData.value && authData.value.success) {
   userInfo.value = authData.value.user
}

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const isNotificationsOpen = ref(false)
const notificationContainer = ref<HTMLElement | null>(null)

const notifications = ref([
  { id: 1, title: 'Nhiệm vụ mới', description: 'Bạn được phân công nhiệm vụ "Thiết kế Mobile App"', time: '5 phút trước', read: false },
  { id: 2, title: 'Cập nhật hệ thống', description: 'Hệ thống đã được cập nhật lên phiên bản 2.0', time: '1 giờ trước', read: true },
  { id: 3, title: 'Nhắc nhở họp', description: 'Cuộc họp team Marketing bắt đầu lúc 14:00', time: '3 giờ trước', read: true },
  { id: 4, title: 'Thanh toán thành công', description: 'Gói Premium của bạn đã được gia hạn', time: '1 ngày trước', read: true },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value
}

const closeNotifications = () => {
  isNotificationsOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target as Node)) {
    closeDropdown()
  }
  if (notificationContainer.value && !notificationContainer.value.contains(event.target as Node)) {
    closeNotifications()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
