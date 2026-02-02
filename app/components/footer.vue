<template>
  <nav class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe shadow-top-lg">
    <div class="flex h-16 items-center justify-around px-2">
      <!-- Main Links (first 3) -->
      <NuxtLink
        v-for="link in mainLinks"
        :key="link.to"
        :to="link.to"
        class="flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200"
        :class="[
          isActive(link.to) 
            ? 'text-primary-600 dark:text-primary-400' 
            : 'text-gray-600 dark:text-gray-400'
        ]"
      >
        <div 
          class="flex items-center justify-center transition-all duration-200"
          :class="isActive(link.to) ? 'scale-110' : 'scale-100'"
        >
          <UIcon :name="link.icon" class="w-6 h-6" />
        </div>
        <span 
          class="text-[10px] leading-tight text-center"
          :class="isActive(link.to) ? 'font-bold' : 'font-medium'"
        >
          {{ link.label }}
        </span>
      </NuxtLink>

      <!-- More Button -->
      <button
        @click="isMoreMenuOpen = true"
        class="flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200 text-gray-600 dark:text-gray-400"
      >
        <div class="flex items-center justify-center">
          <UIcon name="i-heroicons-ellipsis-horizontal-circle" class="w-6 h-6" />
        </div>
        <span class="text-[10px] leading-tight text-center font-medium">
          Khác
        </span>
      </button>
    </div>

    <!-- More Menu Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-full"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-full"
    >
      <div v-if="isMoreMenuOpen" class="fixed inset-0 z-[100] flex items-end">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm" 
          @click="isMoreMenuOpen = false"
        ></div>
        
        <!-- Menu Content -->
        <div class="relative w-full bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl max-h-[70vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Tính năng khác</h3>
            <button 
              @click="isMoreMenuOpen = false"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Menu List -->
          <div class="flex-1 overflow-y-auto p-2">
            <NuxtLink
              v-for="link in moreLinks"
              :key="link.to"
              :to="link.to"
              @click="isMoreMenuOpen = false"
              class="flex items-center gap-4 p-4 rounded-xl transition-colors"
              :class="[
                isActive(link.to)
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              ]"
            >
              <div 
                class="w-12 h-12 rounded-xl flex items-center justify-center"
                :class="[
                  isActive(link.to)
                    ? 'bg-primary-100 dark:bg-primary-900/40'
                    : 'bg-gray-100 dark:bg-gray-800'
                ]"
              >
                <UIcon :name="link.icon" class="w-6 h-6" />
              </div>
              <div class="flex-1">
                <div class="font-semibold">{{ link.label }}</div>
                <div v-if="link.description" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {{ link.description }}
                </div>
              </div>
              <UIcon 
                v-if="isActive(link.to)"
                name="i-heroicons-check-circle" 
                class="w-5 h-5 text-primary-600 dark:text-primary-400" 
              />
            </NuxtLink>

            <!-- Divider -->
            <div class="border-t border-gray-200 dark:border-gray-800 my-2"></div>

            <!-- Logout Button -->
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
            >
              <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-red-100 dark:bg-red-900/40">
                <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-6 h-6" />
              </div>
              <div class="flex-1 text-left">
                <div class="font-semibold">Đăng xuất</div>
                <div class="text-xs text-red-500 dark:text-red-400 mt-0.5">
                  Thoát khỏi tài khoản
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const props = defineProps<{
  links: any[]
}>()

const route = useRoute()
const router = useRouter()
const isMoreMenuOpen = ref(false)

// Split links: first 3 are main, rest are in "More"
const mainLinks = computed(() => props.links.slice(0, 3))
const moreLinks = computed(() => props.links.slice(3))

// Simple active state check
const isActive = (path: string) => route.path === path

// Logout handler
const handleLogout = async () => {
  try {
    // Clear ALL auth cookies - this is critical!
    const authCookie = useCookie('auth_token')
    const licenseCookie = useCookie('license_key')
    const memberIdCookie = useCookie('member_id')
    const memberRoleCookie = useCookie('member_role')
    
    authCookie.value = null
    licenseCookie.value = null
    memberIdCookie.value = null
    memberRoleCookie.value = null
    
    // Close the modal
    isMoreMenuOpen.value = false
    
    // Show success message
    useToast().add({
      title: 'Đăng xuất thành công',
      description: 'Bạn đã đăng xuất khỏi hệ thống',
      color: 'success'
    })
    
    // Redirect to home page
    await router.push('/')
  } catch (error) {
    useToast().add({
      title: 'Lỗi',
      description: 'Không thể đăng xuất. Vui lòng thử lại.',
      color: 'error'
    })
  }
}
</script>

<style scoped>
.shadow-top-lg {
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05), 0 -2px 4px -1px rgba(0, 0, 0, 0.03);
}
</style>
