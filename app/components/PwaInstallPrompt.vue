<template>
  <Transition
    enter-active-class="transform transition ease-out duration-300"
    enter-from-class="translate-y-full opacity-0 sm:translate-y-10"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0 sm:translate-y-10"
  >
    <div v-if="showPrompt" class="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 p-5 z-[9999]">
      <div class="flex items-start gap-4">
        <div class="flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl p-0 overflow-hidden">
          <img src="/logo.png" alt="App Icon" class="w-14 h-14 object-cover" />
        </div>
        <div class="flex-1 min-w-0">
          <h3 class="font-semibold text-gray-900 dark:text-white text-base">Cài đặt ứng dụng</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">Cài đặt ứng dụng ngay trên màn hình chính để truy cập nhanh chóng hơn.</p>
        </div>
      </div>
      
      <div class="mt-5 flex flex-col gap-2">
        <UButton block color="primary" class="font-bold" @click="installPwa">
          Cài đặt ngay
        </UButton>
      </div>

      <div class="mt-4 flex justify-center items-center gap-4 text-xs font-medium text-gray-400">
        <button @click="dismiss(false)" class="hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1">Làm sau</button>
        <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
        <button @click="dismiss(true)" class="hover:text-gray-600 dark:hover:text-gray-300 transition-colors py-1">Không hiển thị lại</button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const showPrompt = ref(false)
const deferredPrompt = ref<any>(null)

onMounted(() => {
  // Check if user has permanently dismissed the prompt
  if (localStorage.getItem('pwa-hidden') === 'true') return

  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault()
    // Stash the event so it can be triggered later.
    deferredPrompt.value = e
    // Update UI notify the user they can install the PWA
    showPrompt.value = true
  })
})

const installPwa = async () => {
  if (!deferredPrompt.value) return
  // Show the install prompt
  deferredPrompt.value.prompt()
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.value.userChoice
  
  if (outcome === 'accepted') {
    showPrompt.value = false
  }
  // We've used the prompt, and can't use it again, discard it
  deferredPrompt.value = null
}

const dismiss = (forever: boolean) => {
  showPrompt.value = false
  if (forever) {
    localStorage.setItem('pwa-hidden', 'true')
  }
}
</script>
