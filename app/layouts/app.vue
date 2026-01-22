<template>
  <div class="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex flex-col w-64 xl:w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-screen sticky top-0 z-40">
      <div class="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xl tracking-tight">
          <UIcon name="i-heroicons-squares-2x2" class="w-8 h-8"/>
          <span>SheetVN</span>
        </div>
      </div>

      <div class="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <UNavigationMenu 
          orientation="vertical"
          :items="links" 
          class="w-full"
        />
      </div>

      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <UButton 
          to="/" 
          variant="ghost" 
          color="neutral" 
          block 
          class="justify-start text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <template #leading>
            <UIcon name="i-heroicons-arrow-left-on-rectangle" class="w-5 h-5" />
          </template>
          Đăng xuất
        </UButton>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-w-0 md:h-screen overflow-hidden">
      
      <!-- Top Header -->
      <Header />

      <!-- Scrollable Page Content -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-950 p-4 pb-24 md:p-6 md:pb-6 relative">
        <slot />
      </main>

      <!-- Mobile Bottom Navigation (Footer) -->
      <div class="md:hidden fixed bottom-0 left-0 right-0 z-50">
        <Footer :links="mobileLinks" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Desktop menu - all items
const links = [
  {
    label: 'Thống kê',
    icon: 'i-heroicons-chart-bar',
    to: '/dashboard'
  },
  {
    label: 'Phòng ban',
    icon: 'i-heroicons-building-office-2',
    to: '/departments'
  },
  {
    label: 'Nhân viên',
    icon: 'i-heroicons-user-group',
    to: '/employees'
  },
  {
    label: 'Tài khoản',
    icon: 'i-heroicons-user-circle',
    to: '/accounts'
  },
  {
    label: 'Tiến độ',
    icon: 'i-heroicons-chart-pie',
    to: '/progress'
  },
  {
    label: 'Nhiệm vụ',
    icon: 'i-heroicons-clipboard-document-list',
    to: '/tasks'
  },
  {
    label: 'Cài đặt',
    icon: 'i-heroicons-cog-6-tooth',
    to: '/settings'
  }
]

// Mobile menu - only 4 items
const mobileLinks = [
  {
    label: 'Thống kê',
    icon: 'i-heroicons-chart-bar',
    to: '/dashboard'
  },
  {
    label: 'Nhân viên',
    icon: 'i-heroicons-user-group',
    to: '/employees'
  },
  {
    label: 'Phòng ban',
    icon: 'i-heroicons-building-office-2',
    to: '/departments'
  },
  {
    label: 'Tài khoản',
    icon: 'i-heroicons-user-circle',
    to: '/accounts'
  }
]
</script>
