<template>
  <div class="max-w-5xl mx-auto space-y-8">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Quản lý Danh mục
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          Tạo và quản lý các danh mục công việc cho doanh nghiệp.
        </p>
      </div>
      <UButton
        v-if="userInfo.role === 'Owner'"
        label="Thêm danh mục"
        icon="i-heroicons-plus"
        color="primary"
        @click="openCreateModal"
      />
    </div>

    <!-- Categories Grid -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div class="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-tag" class="w-5 h-5 text-primary-500" />
            Danh sách danh mục ({{ categories.length }})
          </h3>
          <UInput 
            v-model="searchQuery" 
            icon="i-heroicons-magnifying-glass" 
            placeholder="Tìm danh mục..." 
            size="sm" 
            color="neutral"
            class="w-48"
          />
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="fetchStatus === 'pending'" class="p-12 text-center">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
        <p class="text-gray-500">Đang tải danh mục...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredCategories.length === 0" class="p-12 text-center">
        <UIcon name="i-heroicons-tag" class="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
        <p class="text-gray-500 text-lg">{{ searchQuery ? 'Không tìm thấy danh mục phù hợp' : 'Chưa có danh mục nào' }}</p>
      </div>

      <!-- Categories List -->
      <div v-else class="divide-y divide-gray-100 dark:divide-gray-800">
        <div 
          v-for="category in filteredCategories" 
          :key="category.id"
          class="p-4 sm:p-5 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
        >
          <!-- Icon & Color Preview -->
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
            :style="{ backgroundColor: category.color + '20' }"
          >
            <UIcon :name="category.icon" class="w-6 h-6" :style="{ color: category.color }" />
          </div>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h4 class="font-semibold text-gray-900 dark:text-white truncate">{{ category.name }}</h4>
              <UBadge v-if="category.is_default" size="xs" color="neutral" variant="subtle">
                Mặc định
              </UBadge>
            </div>
            <div class="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span class="flex items-center gap-1">
                <UIcon :name="category.icon" class="w-4 h-4" />
                {{ category.icon }}
              </span>
              <span class="flex items-center gap-1">
                <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: category.color }"></span>
                {{ category.color }}
              </span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <UButton
              v-if="userInfo.role === 'Owner'"
              icon="i-heroicons-pencil-square"
              size="sm"
              color="neutral"
              variant="ghost"
              @click="openEditModal(category)"
            />
            <UButton
              v-if="userInfo.role === 'Owner' && !category.is_default"
              icon="i-heroicons-trash"
              size="sm"
              color="error"
              variant="ghost"
              @click="confirmDelete(category)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Info Card -->
    <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 sm:p-6">
      <div class="flex gap-4">
        <UIcon name="i-heroicons-information-circle" class="w-6 h-6 text-blue-500 shrink-0" />
        <div class="text-sm text-blue-700 dark:text-blue-300 space-y-2">
          <p><strong>Lưu ý:</strong></p>
          <ul class="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
            <li>Các danh mục mặc định được giữ lại để không ảnh hưởng dữ liệu cũ</li>
            <li>Không thể xóa danh mục đang được sử dụng bởi các nhiệm vụ</li>
            <li>Danh mục được phân biệt theo mã giấy phép doanh nghiệp</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isModalOpen" class="fixed inset-0 z-[100] overflow-y-auto">
        <div class="fixed inset-0 bg-gray-500/75 transition-opacity" @click="isModalOpen = false"></div>
        
        <div class="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
          <div class="relative w-full h-[100dvh] sm:h-auto max-w-md transform bg-white dark:bg-gray-900 text-left shadow-2xl transition-all sm:rounded-xl border-0 sm:border border-gray-100 dark:border-gray-700 flex flex-col">
            
            <!-- Header -->
            <div class="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới' }}
              </h3>
              <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-500">
                <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
              </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="submitForm" class="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto">
              <!-- Name -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tên danh mục <span class="text-red-500">*</span>
                </label>
                <UInput 
                  v-model="form.name" 
                  placeholder="Nhập tên danh mục..." 
                  size="lg"
                  class="w-full"
                />
              </div>

              <!-- Icon Picker -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Biểu tượng <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-5 gap-2">
                  <button
                    v-for="icon in availableIcons"
                    :key="icon.value"
                    type="button"
                    @click="form.icon = icon.value"
                    class="p-3 rounded-lg border-2 transition-all flex items-center justify-center"
                    :class="form.icon === icon.value 
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-200'"
                  >
                    <UIcon 
                      :name="icon.value" 
                      class="w-5 h-5" 
                      :class="form.icon === icon.value ? 'text-primary-600' : 'text-gray-500'" 
                    />
                  </button>
                </div>
              </div>

              <!-- Color Picker -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Màu sắc <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-6 gap-2">
                  <button
                    v-for="color in availableColors"
                    :key="color"
                    type="button"
                    @click="form.color = color"
                    class="w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center"
                    :style="{ backgroundColor: color }"
                    :class="form.color === color 
                      ? 'border-gray-900 dark:border-white ring-2 ring-offset-2 ring-gray-400' 
                      : 'border-transparent hover:scale-110'"
                  >
                    <UIcon 
                      v-if="form.color === color" 
                      name="i-heroicons-check" 
                      class="w-5 h-5 text-white" 
                    />
                  </button>
                </div>
                <!-- Custom Color Input -->
                <div class="flex items-center gap-2 mt-3">
                  <input 
                    type="color" 
                    v-model="form.color"
                    class="w-10 h-10 rounded-lg cursor-pointer border-0"
                  />
                  <UInput 
                    v-model="form.color"
                    placeholder="#000000"
                    size="sm"
                    class="flex-1"
                  />
                </div>
              </div>

              <!-- Preview -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Xem trước</label>
                <div class="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div 
                    class="w-10 h-10 rounded-lg flex items-center justify-center"
                    :style="{ backgroundColor: form.color + '20' }"
                  >
                    <UIcon :name="form.icon || 'i-heroicons-tag'" class="w-5 h-5" :style="{ color: form.color }" />
                  </div>
                  <span class="font-medium text-gray-900 dark:text-white">{{ form.name || 'Tên danh mục' }}</span>
                </div>
              </div>
            </form>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <UButton color="neutral" variant="ghost" @click="isModalOpen = false">Hủy</UButton>
              <UButton 
                color="primary" 
                @click="submitForm"
                :loading="isSubmitting"
                :disabled="!form.name || !form.icon || !form.color"
              >
                {{ isEditing ? 'Lưu thay đổi' : 'Tạo danh mục' }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isDeleteModalOpen" class="fixed inset-0 z-[100] overflow-y-auto">
        <div class="fixed inset-0 bg-gray-500/75 transition-opacity" @click="isDeleteModalOpen = false"></div>
        
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative max-w-sm w-full bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700">
            <div class="text-center">
              <div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-500" />
              </div>
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">Xác nhận xóa</h3>
              <p class="text-gray-500 mb-6">
                Bạn có chắc chắn muốn xóa danh mục "<strong>{{ deletingCategory?.name }}</strong>"?
              </p>
              <div class="flex gap-3 justify-center">
                <UButton color="neutral" variant="ghost" @click="isDeleteModalOpen = false">Hủy</UButton>
                <UButton color="error" @click="deleteCategory" :loading="isDeleting">Xóa</UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

definePageMeta({
  layout: 'app'
})

useHead({
  title: 'Quản lý Danh mục - SheetVN'
})

// Types
interface Category {
  id: string
  name: string
  icon: string
  color: string
  license_key: string
  is_default: boolean
  created_at: string
}

// Available Icons
const availableIcons = [
  { value: 'i-heroicons-video-camera', label: 'Video' },
  { value: 'i-heroicons-photo', label: 'Photo' },
  { value: 'i-heroicons-document-text', label: 'Document' },
  { value: 'i-heroicons-briefcase', label: 'Business' },
  { value: 'i-heroicons-paint-brush', label: 'Design' },
  { value: 'i-heroicons-code-bracket', label: 'Code' },
  { value: 'i-heroicons-megaphone', label: 'Marketing' },
  { value: 'i-heroicons-clipboard-document-list', label: 'Admin' },
  { value: 'i-heroicons-ellipsis-horizontal-circle', label: 'Other' },
  { value: 'i-heroicons-chart-bar', label: 'Chart' },
  { value: 'i-heroicons-users', label: 'Users' },
  { value: 'i-heroicons-cog-6-tooth', label: 'Settings' },
  { value: 'i-heroicons-academic-cap', label: 'Education' },
  { value: 'i-heroicons-shopping-cart', label: 'Shopping' },
  { value: 'i-heroicons-heart', label: 'Heart' }
]

// Available Colors
const availableColors = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6',
  '#8B5CF6', '#EC4899', '#64748B', '#0EA5E9', '#14B8A6', '#A855F7'
]

// State
const searchQuery = ref('')
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const editingId = ref<string | null>(null)
const deletingCategory = ref<Category | null>(null)

const form = reactive({
  name: '',
  icon: 'i-heroicons-tag',
  color: '#3B82F6'
})

// User Info
const userInfo = ref({ role: 'Owner' })
const { data: authData } = await useFetch<any>('/api/auth/me')
if (authData.value && authData.value.success) {
  userInfo.value = authData.value.user
}

// Fetch Categories
const { data: categoriesData, refresh: refreshCategories, status: fetchStatus } = await useFetch<Category[]>('/api/categories')
const categories = computed(() => categoriesData.value || [])

const filteredCategories = computed(() => {
  if (!searchQuery.value) return categories.value
  const q = searchQuery.value.toLowerCase()
  return categories.value.filter(c => c.name.toLowerCase().includes(q))
})

// Actions
const toast = useToast()

const resetForm = () => {
  form.name = ''
  form.icon = 'i-heroicons-tag'
  form.color = '#3B82F6'
}

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  resetForm()
  isModalOpen.value = true
}

const openEditModal = (category: Category) => {
  isEditing.value = true
  editingId.value = category.id
  form.name = category.name
  form.icon = category.icon
  form.color = category.color
  isModalOpen.value = true
}

const confirmDelete = (category: Category) => {
  deletingCategory.value = category
  isDeleteModalOpen.value = true
}

const submitForm = async () => {
  if (!form.name || !form.icon || !form.color) return
  
  isSubmitting.value = true
  
  try {
    if (isEditing.value && editingId.value) {
      await $fetch(`/api/categories/${editingId.value}`, {
        method: 'PUT',
        body: {
          name: form.name,
          icon: form.icon,
          color: form.color
        }
      })
      toast.add({ title: 'Thành công', description: 'Đã cập nhật danh mục', color: 'success' })
    } else {
      await $fetch('/api/categories', {
        method: 'POST',
        body: {
          name: form.name,
          icon: form.icon,
          color: form.color
        }
      })
      toast.add({ title: 'Thành công', description: 'Đã tạo danh mục mới', color: 'success' })
    }
    
    isModalOpen.value = false
    refreshCategories()
  } catch (error: any) {
    toast.add({ 
      title: 'Lỗi', 
      description: error.data?.message || 'Không thể lưu danh mục', 
      color: 'error' 
    })
  } finally {
    isSubmitting.value = false
  }
}

const deleteCategory = async () => {
  if (!deletingCategory.value) return
  
  isDeleting.value = true
  
  try {
    await $fetch(`/api/categories/${deletingCategory.value.id}`, {
      method: 'DELETE'
    })
    toast.add({ title: 'Thành công', description: 'Đã xóa danh mục', color: 'success' })
    isDeleteModalOpen.value = false
    refreshCategories()
  } catch (error: any) {
    toast.add({ 
      title: 'Lỗi', 
      description: error.data?.message || 'Không thể xóa danh mục', 
      color: 'error' 
    })
  } finally {
    isDeleting.value = false
    deletingCategory.value = null
  }
}
</script>
