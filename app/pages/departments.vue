<template>
  <div class="max-w-7xl mx-auto space-y-6 md:space-y-8">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Quản lý Phòng Ban/Nhóm
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">
        Tổ chức cơ cấu nhân sự theo phòng ban, bộ phận hoặc nhóm làm việc.
      </p>
    </div>

    <!-- 1. Create Department Section -->
    <UCard class="ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm">
      <template #header>
        <div class="px-3 py-3 sm:px-6 sm:py-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-plus-circle" class="w-5 h-5 text-primary-500" />
            Tạo Phòng Ban / Nhóm Mới
          </h3>
        </div>
      </template>
      
      <div class="p-3 sm:p-6">
        <form @submit.prevent="createDepartment" class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div class="md:col-span-5">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên phòng ban <span class="text-red-500">*</span></label>
            <UInput 
              v-model="newDepartment.name"
              placeholder="Ví dụ: Phòng Kinh doanh, Team Marketing..."
              icon="i-heroicons-building-office-2"
              class="w-full"
              size="lg"
            />
          </div>
          <div class="md:col-span-5">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả (Tùy chọn)</label>
            <UInput 
              v-model="newDepartment.description"
              placeholder="Mô tả chức năng, nhiệm vụ..."
              icon="i-heroicons-information-circle"
              class="w-full"
              size="lg"
            />
          </div>
          <div class="md:col-span-2">
            <UButton 
              type="submit" 
              color="primary" 
              size="lg"
              block
              :loading="isCreating"
              :disabled="!newDepartment.name"
            >
              Thêm mới
            </UButton>
          </div>
        </form>
      </div>
    </UCard>

    <!-- 2. Departments List -->
    <UCard class="ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm overflow-hidden">
      <template #header>
        <div class="px-3 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Danh sách Phòng Ban ({{ departments.length }})</h3>
          
          <!-- Search/Filter could go here -->
          <UInput 
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Tìm kiếm..."
            size="sm"
            color="neutral"
            class="w-64"
          />
        </div>
      </template>

      <!-- Custom Table View -->
      <!-- Desktop Table View -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th scope="col" class="px-3 py-3 sm:px-6 font-medium">Tên Phòng Ban</th>
              <th scope="col" class="px-3 py-3 sm:px-6 font-medium">Thành viên</th>
              <th scope="col" class="px-3 py-3 sm:px-6 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="dept in filteredDepartments" :key="dept.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <td class="px-3 py-3 sm:px-6 sm:py-4 font-medium text-gray-900 dark:text-white">
                <div class="flex items-center gap-3">
                  <div class="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400">
                    <UIcon name="i-heroicons-user-group" class="w-5 h-5" />
                  </div>
                  <div>
                    <div class="text-base font-semibold">{{ dept.name }}</div>
                    <div class="text-xs text-gray-500 font-normal">{{ dept.description || 'Chưa có mô tả' }}</div>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3 sm:px-6 sm:py-4">
                <div class="flex flex-wrap gap-1.5">
                  <!-- Leader first -->
                  <template v-for="member in dept.members" :key="'leader-' + member.id">
                    <UBadge 
                      v-if="member.role === 'Leader'"
                      color="primary" 
                      variant="solid"
                      size="xs"
                      class="pr-1.5"
                    >
                      {{ member.name }}
                      <UIcon name="i-heroicons-star" class="w-3 h-3 ml-1" />
                    </UBadge>
                  </template>

                  <!-- Other members (limit to 3 for neatness) -->
                  <template v-for="(member, idx) in dept.members.filter(m => m.role !== 'Leader').slice(0, 3)" :key="member.id">
                    <UBadge 
                      color="neutral" 
                      variant="subtle"
                      size="xs"
                    >
                      {{ member.name }}
                    </UBadge>
                  </template>

                  <!-- Remaining count -->
                  <span v-if="dept.members.filter(m => m.role !== 'Leader').length > 3" class="text-xs text-gray-500 flex items-center px-1">
                    +{{ dept.members.filter(m => m.role !== 'Leader').length - 3 }}
                  </span>

                  <div v-if="dept.members.length === 0" class="text-gray-400 italic text-xs">
                    Chưa có thành viên
                  </div>
                </div>
              </td>
              <td class="px-3 py-3 sm:px-6 sm:py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <UButton icon="i-heroicons-pencil-square" size="sm" color="neutral" variant="ghost" @click="openEditModal(dept)" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile List View -->
      <div class="sm:hidden space-y-3 p-3 pt-0">
        <div 
          v-for="dept in filteredDepartments" 
          :key="'mobile-' + dept.id"
          class="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3"
        >
          <!-- Header -->
          <div class="flex items-start justify-between gap-3">
             <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 shrink-0">
                   <UIcon name="i-heroicons-user-group" class="w-5 h-5" />
                </div>
                <div>
                   <h4 class="text-base font-bold text-gray-900 dark:text-white leading-tight mb-0.5">{{ dept.name }}</h4>
                   <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{{ dept.description || 'Chưa có mô tả' }}</p>
                </div>
             </div>
             <UButton 
               icon="i-heroicons-pencil-square" 
               size="xs" 
               color="neutral" 
               variant="ghost" 
               @click="openEditModal(dept)" 
             />
          </div>

          <!-- Divider -->
          <div class="h-px bg-gray-100 dark:bg-gray-800 w-full" v-if="dept.members.length > 0"></div>

          <!-- Members Grid -->
          <div v-if="dept.members.length > 0">
             <div class="flex flex-wrap gap-2">
                <!-- Leader -->
                <template v-for="member in dept.members" :key="'m-mobile-l-' + member.id">
                  <UBadge 
                    v-if="member.role === 'Leader'"
                    color="primary" 
                    variant="soft"
                    size="xs"
                    class="pr-1.5"
                  >
                    {{ member.name }}
                    <UIcon name="i-heroicons-star" class="w-3 h-3 ml-1" />
                  </UBadge>
                </template>
                
                <!-- Members -->
                <template v-for="(member) in dept.members.filter(m => m.role !== 'Leader')" :key="'m-mobile-' + member.id">
                   <span class="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                     {{ member.name }}
                   </span>
                </template>
             </div>
          </div>
          <div v-else class="text-center text-xs text-gray-400 italic py-1">
             Chưa có thành viên
          </div>
        </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredDepartments.length === 0" class="p-12 text-center text-gray-500">
         <UIcon name="i-heroicons-folder-open" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
         <p>Không tìm thấy phòng ban nào.</p>
      </div>

    </UCard>

    <!-- Custom Edit Department Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isEditModalOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" style="background-color: rgba(0,0,0,0.5);">
        <!-- Backdrop click to close -->
        <div class="absolute inset-0" @click="isEditModalOpen = false"></div>

        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-gray-900 w-full h-[100dvh] sm:h-auto sm:max-w-lg sm:rounded-lg shadow-xl overflow-hidden flex flex-col ring-1 ring-gray-200 dark:ring-gray-800">
          
          <!-- Header -->
          <div class="px-3 py-3 sm:px-6 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              Chỉnh sửa Phòng Ban
            </h3>
            <button @click="isEditModalOpen = false" class="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-3 sm:p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên phòng ban <span class="text-red-500">*</span></label>
              <UInput v-model="editingDepartment.name" size="lg" autofocus class="w-full"/>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mô tả</label>
              <UInput v-model="editingDepartment.description" size="lg" class="w-full"/>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-3 py-3 sm:px-6 sm:py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
             <UButton color="neutral" variant="ghost" @click="isEditModalOpen = false">Hủy bỏ</UButton>
             <UButton color="primary" @click="updateDepartment">Lưu thay đổi</UButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

useHead({
  title: 'Quản lý Phòng Ban - SheetVN'
})

// --- State ---
const searchQuery = ref('')
const isCreating = ref(false)
const isEditModalOpen = ref(false)
const newDepartment = reactive({
  name: '',
  description: ''
})
const editingDepartment = reactive({
  id: '' as string | number,
  name: '',
  description: ''
})

// --- Types ---
interface Member {
  id: string | number
  name: string
  avatar?: string
  role?: 'Leader' | 'Member'
}

interface Department {
  id: string | number
  name: string
  description: string
  members: Member[]
}

// --- Data Fetching ---
const { data: departmentsData, refresh } = await useFetch<Department[]>('/api/departments')

const departments = computed(() => departmentsData.value || [])

// --- Computed ---
const filteredDepartments = computed(() => {
  if (!searchQuery.value) return departments.value
  const query = searchQuery.value.toLowerCase()
  return departments.value.filter(d => 
    d.name.toLowerCase().includes(query) || 
    d.description.toLowerCase().includes(query)
  )
})

const toast = useToast()

// --- Actions ---
const createDepartment = async () => {
  if (!newDepartment.name) return
  
  isCreating.value = true
  try {
    await $fetch('/api/departments', {
      method: 'POST',
      body: {
        name: newDepartment.name,
        description: newDepartment.description
      }
    })
    
    toast.add({ title: 'Thành công', description: 'Đã tạo phòng ban mới', color: 'success' })
    
    // Reset form & Refresh list
    newDepartment.name = ''
    newDepartment.description = ''
    await refresh()
    
  } catch (error: any) {
    toast.add({ 
      title: 'Lỗi', 
      description: error.data?.message || 'Không thể tạo phòng ban', 
      color: 'error' 
    })
  } finally {
    isCreating.value = false
  }
}

const openEditModal = (dept: Department) => {
  editingDepartment.id = dept.id
  editingDepartment.name = dept.name
  editingDepartment.description = dept.description
  isEditModalOpen.value = true
}

const updateDepartment = async () => {
  try {
    await $fetch(`/api/departments/${editingDepartment.id}`, {
      method: 'PUT',
      body: {
        name: editingDepartment.name,
        description: editingDepartment.description
      }
    })
    
    toast.add({ title: 'Thành công', description: 'Đã cập nhật thông tin', color: 'success' })
    await refresh()
    isEditModalOpen.value = false
  } catch (error: any) {
    toast.add({ 
       title: 'Lỗi', 
       description: error.data?.message || 'Không thể cập nhật', 
       color: 'error' 
    })
  }
}
</script>
