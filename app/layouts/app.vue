<template>
  <div class="flex flex-col md:flex-row min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex flex-col w-64 xl:w-72 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 h-screen sticky top-0 z-40">
      <div class="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
        <div class="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-xl tracking-tight">
          <UIcon name="i-heroicons-squares-2x2" class="w-8 h-8"/>
          <span>QL CÔNG VIỆC</span>
        </div>
      </div>

      <div class="flex-1 py-8 px-6 space-y-4 overflow-y-auto">
        <UNavigationMenu 
          orientation="vertical"
          :items="links"
          :ui="{ 
             link: 'py-3 text-base'
          }"
          class="w-full space-y-2"
        />
      </div>

      <div class="p-4 border-t border-gray-200 dark:border-gray-800">
        <UButton 
          @click="handleLogout"
          variant="ghost" 
          color="neutral" 
          block 
          class="justify-start text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
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
    <PwaInstallPrompt />
  </div>
</template>

<script setup lang="ts">
// Menu Configuration
const allLinks = [
  { label: 'Thống kê', icon: 'i-heroicons-chart-bar', to: '/dashboard', roles: ['Owner', 'Leader'], description: 'Xem báo cáo và thống kê' },
  { label: 'Phòng ban', icon: 'i-heroicons-building-office-2', to: '/departments', roles: ['Owner'], description: 'Quản lý phòng ban' },
  { label: 'Nhân viên', icon: 'i-heroicons-user-group', to: '/employees', roles: ['Owner', 'Leader'], description: 'Quản lý nhân viên' },
  { label: 'Danh mục', icon: 'i-heroicons-tag', to: '/categories', roles: ['Owner'], description: 'Quản lý danh mục công việc' },
  { label: 'Tiến độ', icon: 'i-heroicons-chart-pie', to: '/progress', roles: ['Owner', 'Leader', 'Member'], description: 'Theo dõi tiến độ công việc' },
  { label: 'Nhiệm vụ', icon: 'i-heroicons-clipboard-document-list', to: '/tasks', roles: ['Owner', 'Leader', 'Member'], description: 'Quản lý nhiệm vụ' },
  { label: 'Lịch', icon: 'i-heroicons-calendar', to: '/calender', roles: ['Owner', 'Leader', 'Member'], description: 'Xem lịch công việc' },
  { label: 'Cài đặt', icon: 'i-heroicons-cog-6-tooth', to: '/settings', roles: ['Owner', 'Leader', 'Member'], description: 'Cài đặt hệ thống' }
]

// State for filtered links
const visibleLinks = ref<any[]>([])
const visibleMobileLinks = ref<any[]>([])

const { clearLicense } = useLicense()

const handleLogout = async () => {
  try {
    // 1. Call Server Logout to clear HttpOnly cookies (if any)
    await $fetch('/api/auth/logout', { method: 'POST' })
    
    // 2. Clear Client State
    clearLicense()
    
    // 3. Manually clear cookies accessible to JS (just in case)
    const memberId = useCookie('member_id')
    const memberRole = useCookie('member_role')
    const licenseKey = useCookie('license_key')
    
    memberId.value = null
    memberRole.value = null
    licenseKey.value = null

    // 4. Redirect
    await navigateTo('/')
  } catch (error) {
    console.error('Logout failed', error)
    await navigateTo('/')
  }
}

onMounted(() => {
  // Determine Role
  // If member_id cookie exists, we are a Member or Leader based on member_role
  // If NOT exists but we are logged in (license_key check assumed), we are Owner.
  
  const memberId = useCookie('member_id').value
  const memberRole = useCookie('member_role').value
  
  /* Fix: Check memberRole properly. Do not default to Member if role is Owner */
  let currentRole = 'Owner'
  if (memberId) {
     if (memberRole && ['Owner', 'Leader', 'Member'].includes(memberRole as string)) {
        currentRole = memberRole as string
     } else {
        currentRole = 'Member'
     }
  }
  
  // Filter logic
  visibleLinks.value = allLinks.filter(link => link.roles.includes(currentRole))
  
  // Mobile: usually a subset, or same? 
  // User said: "sửa cả mobile và desktop menu nhé"
  // Previous mobile links were: Dashboard, Employees, Depts, Tasks.
  // We should apply the same role filter.
  // Let's just use the same filtered list for simplicity, maybe limiting count if needed, but 4-5 items fit on mobile nav.
  visibleMobileLinks.value = visibleLinks.value
})

// Bind to template
const links = computed(() => visibleLinks.value)
const mobileLinks = computed(() => visibleMobileLinks.value)
</script>
