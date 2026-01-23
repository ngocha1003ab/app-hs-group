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


    <!-- Company Settings Form (Owner Only) -->
    <div v-if="isOwner" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div class="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-heroicons-building-office-2" class="w-5 h-5 text-primary-500" />
          Thông tin Công ty
        </h3>
        <p class="text-sm text-gray-500 mt-1">Cập nhật tên và mô tả hiển thị trên hệ thống.</p>
      </div>
      
      <form @submit.prevent="saveCompanySettings" class="p-6 space-y-6">
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tên công ty <span class="text-red-500">*</span>
          </label>
          <UInput 
            class="w-full"
            v-model="companyForm.companyName" 
            placeholder="Nhập tên công ty..." 
            size="lg" 
            icon="i-heroicons-building-library"
          />
        </div>
        
        <div class="space-y-2">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Mô tả / Giới thiệu
          </label>
          <UTextarea 
            class="w-full"
            v-model="companyForm.description" 
            placeholder="Nhập mô tả ngắn về công ty..." 
            :rows="5"
            size="lg"
            variant="outline"
          />
        </div>

        <div class="pt-4 flex items-center justify-end border-t border-gray-100 dark:border-gray-800">
          <UButton 
            type="submit" 
            size="lg" 
            color="primary" 
            icon="i-heroicons-check"
            :loading="isSubmittingCompany"
            :disabled="!companyForm.companyName"
          >
            Lưu thông tin công ty
          </UButton>
        </div>
      </form>
    </div>

    <!-- Personal Profile Form (Everyone) -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div class="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-heroicons-user-circle" class="w-5 h-5 text-primary-500" />
          Thông tin cá nhân
        </h3>
        <p class="text-sm text-gray-500 mt-1">Cập nhật ảnh đại diện và thông tin hiển thị của bạn.</p>
      </div>
      
      <form @submit.prevent="saveProfileSettings" class="p-6 space-y-6">
        <div class="flex items-start gap-6">
            <!-- Avatar Preview -->
            <div class="flex-shrink-0">
                <UAvatar :src="profileForm.avatar" size="3xl" :alt="profileForm.name" />
            </div>
            
            <div class="flex-1 space-y-4">
                 <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ảnh đại diện (URL)
                  </label>
                  <UInput 
                    class="w-full"
                    v-model="profileForm.avatar" 
                    placeholder="https://..." 
                    icon="i-heroicons-photo"
                  />
                  <p class="text-xs text-gray-500">Hỗ trợ đường dẫn ảnh trực tiếp.</p>
                </div>

                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Họ và tên <span class="text-red-500">*</span>
                  </label>
                  <UInput 
                    class="w-full"
                    v-model="profileForm.name" 
                    placeholder="Nhập họ tên của bạn..." 
                    icon="i-heroicons-user"
                  />
                </div>
                
                 <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Số điện thoại
                  </label>
                  <UInput 
                    class="w-full"
                    v-model="profileForm.phone" 
                    placeholder="Nhập số điện thoại..." 
                    icon="i-heroicons-phone"
                  />
                </div>
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tên đăng nhập <span class="text-red-500">*</span>
                  </label>
                  <UInput 
                    class="w-full"
                    v-model="profileForm.username" 
                    placeholder="Nhập tên đăng nhập..."
                    icon="i-heroicons-identification"
                  />
                </div>

                   <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <UInput 
                    class="w-full"
                    v-model="profileForm.email" 
                    placeholder="Nhập email..." 
                    icon="i-heroicons-envelope"
                  />
                </div>
                
                <div class="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                     <h4 class="text-sm font-semibold text-gray-900 dark:text-white">Đổi mật khẩu</h4>
                     <div class="space-y-2">
                      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Mật khẩu mới
                      </label>
                      <UInput 
                        class="w-full"
                        v-model="profileForm.newPassword" 
                        type="password"
                        placeholder="Nhập mật khẩu mới (nếu muốn đổi)..." 
                        icon="i-heroicons-lock-closed"
                      />
                    </div>
                </div>
            </div>
        </div>

        <div class="pt-4 flex items-center justify-end border-t border-gray-100 dark:border-gray-800">
          <UButton 
            type="submit" 
            size="lg" 
            color="primary" 
            icon="i-heroicons-check"
            :loading="isSubmittingProfile"
            :disabled="!profileForm.name || !profileForm.username"
          >
            Lưu thông tin cá nhân
          </UButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

definePageMeta({
  layout: 'app'
})

useHead({
  title: 'Cài đặt - SheetVN'
})

const isSubmittingCompany = ref(false)
const isSubmittingProfile = ref(false)
const toast = useToast()

// 1. Fetch User Info (Role & Profile)
const { data: userData, refresh: refreshUser } = await useFetch<any>('/api/auth/me')
const user = computed(() => userData.value?.user || {})
const isOwner = computed(() => user.value.role === 'Owner')

// 2. Fetch Company Settings (Only needed if owner, but fetching anyway simpler)
const { data: companyData } = await useFetch<any>('/api/settings')

// Forms
const companyForm = reactive({
    companyName: '',
    description: ''
})

const profileForm = reactive({
    name: '',
    username: '',
    avatar: '',
    phone: '',
    email: '',
    newPassword: ''
})

// Initialize forms
watchEffect(() => {
    if (companyData.value) {
        companyForm.companyName = companyData.value.companyName || ''
        companyForm.description = companyData.value.description || ''
    }
    if (user.value) {
        profileForm.name = user.value.name || ''
        profileForm.username = user.value.username || ''
        profileForm.avatar = user.value.avatar || ''
        // Check if user has phone/email (Owner might fetch from settings if implemented in API)
        // Since /api/auth/me returns 'user', we rely on what it returns. 
        // Note: Me API needs to return phone/email if possible.
        profileForm.phone = user.value.phone || '' 
        profileForm.email = user.value.email || '' 
    }
})

// Actions
const saveCompanySettings = async () => {
    isSubmittingCompany.value = true
    try {
        await $fetch('/api/settings/company', {
            method: 'POST',
            body: companyForm
        })
        toast.add({ title: 'Thành công', description: 'Đã cập nhật thông tin công ty.', color: 'green' })
    } catch (e: any) {
        toast.add({ title: 'Lỗi', description: e.message || 'Không thể lưu.', color: 'red' })
    } finally {
        isSubmittingCompany.value = false
    }
}

const saveProfileSettings = async () => {
    isSubmittingProfile.value = true
    try {
        await $fetch('/api/settings/profile', {
            method: 'PUT',
            body: profileForm
        })
        await refreshUser() // Refresh local user data
        toast.add({ title: 'Thành công', description: 'Đã cập nhật thông tin cá nhân.', color: 'green' })
    } catch (e: any) {
        toast.add({ title: 'Lỗi', description: e.message || 'Không thể lưu.', color: 'red' })
    } finally {
        isSubmittingProfile.value = false
    }
}
</script>
