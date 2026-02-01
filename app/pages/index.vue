<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute top-1/2 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-bounce-slow"></div>
    </div>

    <!-- Main Content -->
    <div class="absolute top-4 right-4 z-50">
       <ClientOnly>
          <UButton
            :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
            color="neutral"
            variant="ghost"
            aria-label="Theme"
            @click="isDark = !isDark"
            class="text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-sm"
          />
       </ClientOnly>
    </div>

    <UContainer class="flex-1 flex flex-col items-center justify-center py-12 relative z-10 w-full max-w-4xl">
      
      <!-- Logo / Brand Section (Animated) -->
      <div class="text-center space-y-6 mb-12 animate-fade-in-up">
        <div class="inline-flex items-center justify-center p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg mb-4 ring-1 ring-gray-200 dark:ring-gray-800">
          <!-- Placeholder Logo Icon -->
          <UIcon name="i-heroicons-squares-2x2" class="w-12 h-12 text-primary-600 dark:text-primary-400" />
        </div>
        
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          <span class="text-primary-600 dark:text-primary-400">SheetVN</span> App
        </h1>
        
        <p class="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-light">
          Quản lý công việc nhóm chuyên nghiệp dành cho <br class="hidden sm:block" />
          <span class="font-semibold text-gray-900 dark:text-white">Cửa hàng</span> và <span class="font-semibold text-gray-900 dark:text-white">Doanh nghiệp</span>
        </p>
      </div>

      <!-- License Key Action Card -->
      <UCard class="w-full max-w-lg shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800 backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 animate-fade-in-up delay-100">
        <template #header>
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Nhập mã giấy phép
            </h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Kích hoạt để bắt đầu sử dụng dịch vụ
            </p>
          </div>
        </template>

        <form @submit.prevent="handleLicenseSubmit" class="space-y-4 py-2">
          <UFormField name="license">
            <UInput 
              v-model="licenseKey" 
              icon="i-heroicons-key" 
              placeholder="XXXX-XXXX-XXXX-XXXX" 
              size="xl"
              class="font-mono text-center w-full"
              autofocus
            >
              <template #trailing>
                <div class="text-xs text-gray-400 font-sans">LICENSE</div>
              </template>
            </UInput>
          </UFormField>
          
          <UButton 
            type="submit" 
            block 
            size="xl" 
            :loading="loading"
            class="font-bold transition-transform active:scale-[0.98]"
            icon="i-heroicons-rocket-launch"
          >
            Bắt đầu ngay
          </UButton>
        </form>

        <template #footer>
          <div class="text-center space-y-4">
            <div class="relative">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-white dark:bg-gray-900 text-gray-500">Hoặc</span>
              </div>
            </div>

            <div>
              <p class="text-sm text-gray-600 dark:text-gray-300 mb-2">
                Bạn đã có tài khoản doanh nghiệp?
              </p>
              <UButton 
                to="/login" 
                variant="soft" 
                color="neutral" 
                block
                icon="i-heroicons-user"
              >
                Đăng nhập tài khoản
              </UButton>
            </div>
          </div>
        </template>
      </UCard>
    </UContainer>

    <!-- Footer -->
    <footer class="py-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 z-10">
      <div class="text-center">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Sản phẩm được phát triển bởi <span class="font-bold text-gray-700 dark:text-gray-200">SheetVN</span>
        </p>
        <UButton 
          to="https://sheetvn.com" 
          target="_blank" 
          variant="link" 
          color="primary"
          icon="i-heroicons-shopping-bag"
        >
          Mua thêm bản quyền tại sheetvn.com
        </UButton>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)
const licenseKey = ref('')

const router = useRouter()
const toast = useToast()

const colorMode = useColorMode()
const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

// MOCK: Auto-redirect not strictly needed for demo, but kept simple
// const licenseAuthCookie = useCookie('license_key')
// const memberAuthCookie = useCookie('member_id')
// if (licenseAuthCookie.value || memberAuthCookie.value) { ... }

const handleLicenseSubmit = async () => {
  // MOCK: Bypass validation
  if (!licenseKey.value.trim()) {
     // Optional: fill fake key for UX
     licenseKey.value = 'SHEETVN-DEMO-KEY-2024'
  }
  
  loading.value = true
  
  // Simulate network delay
  setTimeout(async () => {
    loading.value = false
    
    // Mock success
    toast.add({
      title: 'Kích hoạt thành công',
      description: `Chào mừng doanh nghiệp đến với SheetVN`,
      icon: 'i-heroicons-check-circle',
      color: 'success'
    })
    
    await navigateTo('/dashboard')
  }, 800)
}

// SEO Meta
useHead({
  title: 'SheetVN App - Quản lý công việc nhóm',
  meta: [
    { name: 'description', content: 'Ứng dụng quản lý công việc nhóm dành cho cửa hàng và doanh nghiệp của SheetVN' }
  ]
})
</script>

<style scoped>
.animate-bounce-slow {
  animation: bounce 3s infinite;
}
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}
.delay-100 {
  animation-delay: 0.1s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
