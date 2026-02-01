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
                  <p v-if="isOwner" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Tạo tài khoản để đăng nhập với vai trò doanh nghiệp, không cần phải đăng nhập qua mã giấy phép nữa.
                  </p>
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
definePageMeta({
  layout: 'app'
})

useHead({
  title: 'Cài đặt - SheetVN'
})

const { currentUser } = useMockData()
const isSubmittingCompany = ref(false)
const isSubmittingProfile = ref(false)
const toast = useToast()

const user = computed(() => currentUser.value)
const isOwner = computed(() => user.value.role === 'Owner')

// Forms
const companyForm = reactive({
    companyName: 'Công ty TNHH SheetVN',
    description: 'Hệ thống quản lý công việc và nhân sự toàn diện.'
})

const profileForm = reactive({
    name: '',
    username: '',
    avatar: '',
    phone: '',
    email: '',
    newPassword: ''
})

// Initialize forms from current user
watchEffect(() => {
    if (user.value) {
        profileForm.name = user.value.name || ''
        profileForm.username = user.value.username || ''
        profileForm.avatar = user.value.avatar || ''
        profileForm.phone = user.value.phone || '' 
        profileForm.email = user.value.email || '' 
    }
})

// Actions (mock, just show toast)
const saveCompanySettings = () => {
    isSubmittingCompany.value = true
    setTimeout(() => {
        toast.add({ title: 'Thành công', description: 'Đã cập nhật thông tin công ty.', color: 'success' })
        isSubmittingCompany.value = false
    }, 500)
}

const saveProfileSettings = () => {
    isSubmittingProfile.value = true
    setTimeout(() => {
        // Update current user in mock state
        currentUser.value = {
            ...currentUser.value,
            name: profileForm.name,
            username: profileForm.username,
            avatar: profileForm.avatar,
            phone: profileForm.phone,
            email: profileForm.email
        }
        toast.add({ title: 'Thành công', description: 'Đã cập nhật thông tin cá nhân.', color: 'success' })
        isSubmittingProfile.value = false
    }, 500)
}
</script>
