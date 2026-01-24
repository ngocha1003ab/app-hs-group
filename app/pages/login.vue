<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 relative overflow-hidden">
    <!-- Background Decor -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
    </div>

    <!-- Theme Toggle -->
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

    <UCard class="w-full max-w-md z-10 shadow-xl ring-1 ring-gray-200 dark:ring-gray-800 backdrop-blur-sm bg-white/90 dark:bg-gray-900/90 transition-all duration-500 hover:shadow-2xl">
      <template #header>
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/50 mb-2">
            <UIcon name="i-heroicons-user-circle" class="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Đăng nhập</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Truy cập vào không gian làm việc của bạn
          </p>
        </div>
      </template>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <UFormField label="Tên đăng nhập" name="userId" required>
          <UInput 
            v-model="form.userId" 
            icon="i-heroicons-user" 
            placeholder="Nhập tên đăng nhập..." 
            size="lg"
            class="w-full"
            autofocus
          />
        </UFormField>

        <UFormField label="Mật khẩu" name="password" required>
          <UInput 
            v-model="form.password" 
            type="password" 
            icon="i-heroicons-lock-closed" 
            placeholder="Nhập mật khẩu..." 
            class="w-full"
            size="lg"
          />
        </UFormField>

        <UButton 
          type="submit" 
          block 
          size="lg" 
          :loading="loading"
          icon="i-heroicons-arrow-right-on-rectangle"
        >
          Đăng nhập
        </UButton>
      </form>

      <template #footer>
        <div class="text-center text-sm">
          <NuxtLink to="/" class="text-primary-600 dark:text-primary-400 hover:underline flex items-center justify-center gap-1">
            <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
            Quay lại trang chủ
          </NuxtLink>
        </div>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const loading = ref(false)
const form = reactive({
  userId: '',
  password: ''
})

const colorMode = useColorMode()
const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

const toast = useToast()

const handleLogin = async () => {
  if (!form.userId || !form.password) return
  
  loading.value = true
  try {
    await $fetch('/api/auth/member-login', {
      method: 'POST',
      body: {
        username: form.userId,
        password: form.password
      }
    })
    
    // Redirect on success
    return navigateTo('/progress')
  } catch (error: any) {
    const msg = error.data?.message || 'Đăng nhập thất bại'
    toast.add({ title: 'Lỗi', description: msg, color: 'error' })
  } finally {
    loading.value = false
  }
}

// SEO Meta
useHead({
  title: 'Đăng nhập - SheetVN App',
  meta: [
    { name: 'description', content: 'Đăng nhập vào hệ thống quản lý công việc nhóm SheetVN' }
  ]
})
</script>
