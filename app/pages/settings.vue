<template>
  <div class="max-w-3xl mx-auto space-y-8">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Cài đặt
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">
        Quản lý thông tin chung của công ty.
      </p>
    </div>

    <!-- Settings Form -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div class="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-heroicons-building-office-2" class="w-5 h-5 text-primary-500" />
          Thông tin Công ty
        </h3>
        <p class="text-sm text-gray-500 mt-1">Cập nhật tên và mô tả hiển thị trên hệ thống.</p>
      </div>
      
      <form @submit.prevent="saveSettings" class="p-6 space-y-6">
        <!-- Company Name -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tên công ty <span class="text-red-500">*</span>
          </label>
          <UInput 
            class="w-full"
            v-model="settings.companyName" 
            placeholder="Nhập tên công ty..." 
            size="lg" 
            icon="i-heroicons-building-library"
          >
             <template #trailing>
                <UIcon v-if="settings.companyName" name="i-heroicons-check-circle" class="w-5 h-5 text-green-500" />
             </template>
          </UInput>
        </div>
        
        <!-- Description -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mô tả / Giới thiệu
          </label>
          <UTextarea 
            class="w-full"
            v-model="settings.description" 
            placeholder="Nhập mô tả ngắn về công ty..." 
            :rows="5"
            size="lg"
            variant="outline"
          />
          <p class="text-xs text-gray-500 text-right">
             {{ settings.description.length }} ký tự
          </p>
        </div>

        <!-- Actions -->
        <div class="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
          <UButton 
            type="button" 
            color="neutral" 
            variant="ghost"
            @click="resetForm"
            :disabled="isSubmitting"
          >
            Khôi phục mặc định
          </UButton>
          <UButton 
            type="submit" 
            size="lg" 
            color="primary" 
            icon="i-heroicons-check"
            :loading="isSubmitting"
            :disabled="!settings.companyName"
          >
            Lưu thay đổi
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

definePageMeta({
  layout: 'app'
})

useHead({
  title: 'Cài đặt - SheetVN'
})

// --- State ---
const isSubmitting = ref(false)

// Default / Initial Data
const defaultSettings = {
  companyName: 'SheetVN Corp',
  description: 'Nền tảng quản lý công việc và nhân sự hiệu quả hàng đầu Việt Nam.'
}

const settings = reactive({ ...defaultSettings })

// --- Actions ---
const saveSettings = async () => {
  if (!settings.companyName) return
  
  isSubmitting.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // In a real app, you'd show a toast notification here
  alert('Đã lưu cài đặt thành công!')
  
  isSubmitting.value = false
}

const resetForm = () => {
  if(confirm('Bạn có chắc chắn muốn khôi phục về mặc định?')) {
     Object.assign(settings, defaultSettings)
  }
}
</script>
