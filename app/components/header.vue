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
      <UButton 
        color="neutral" 
        variant="ghost" 
        icon="i-heroicons-bell" 
        class="text-gray-500 dark:text-gray-400"
      />
      
      <div class="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
      
      <div class="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <UAvatar 
          src="https://avatars.githubusercontent.com/u/739984?v=4" 
          alt="User Avatar" 
          size="sm"
        />
        <span class="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200 pr-2">
          Admin User
        </span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isDropdownOpen = ref(false)
const dropdownContainer = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownContainer.value && !dropdownContainer.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
