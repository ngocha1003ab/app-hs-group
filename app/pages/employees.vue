<template>
  <div class="max-w-7xl mx-auto space-y-6 md:space-y-8">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Quản lý Nhân sự
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">
        Thêm mới và quản lý thông tin nhân viên trong hệ thống.
      </p>
    </div>

    <!-- 1. Create Member Section -->
    <UCard class="ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm">
      <template #header>
        <div class="px-3 py-3 sm:px-6 sm:py-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-user-plus" class="w-5 h-5 text-primary-500" />
            Thêm Nhân viên Mới
          </h3>
        </div>
      </template>
      
      <form @submit.prevent="createMember" class="p-3 sm:p-6 space-y-6">
        <!-- Personal Info Inputs -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Họ và tên <span class="text-red-500">*</span></label>
            <UInput 
              v-model="newMember.name"
              placeholder="Nhập tên nhân viên"
              icon="i-heroicons-user"
              size="lg"
              class="w-full"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên đăng nhập <span class="text-red-500">*</span></label>
            <UInput 
              v-model="newMember.username"
              placeholder="username"
              icon="i-heroicons-at-symbol"
              size="lg"
              class="w-full"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Mật khẩu <span class="text-red-500">*</span></label>
             <UInput 
              v-model="newMember.password"
              :type="showCreatePassword ? 'text' : 'password'"
              placeholder="••••••"
              icon="i-heroicons-lock-closed"
              size="lg"
              class="w-full"
              :ui="{ leading: 'pointer-events-none' }"
            >
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="ghost"
                  icon="i-heroicons-eye"
                  :padded="false"
                  :class="{ 'text-gray-400': !showCreatePassword, 'text-primary-500': showCreatePassword }"
                  @click="showCreatePassword = !showCreatePassword"
                />
              </template>
            </UInput>
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email (Tùy chọn)</label>
            <UInput 
              v-model="newMember.email"
              placeholder="example@company.com"
              icon="i-heroicons-envelope"
              size="lg"
              class="w-full"
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Số điện thoại (Tùy chọn)</label>
            <UInput 
              v-model="newMember.phone"
              placeholder="0912..."
              icon="i-heroicons-phone"
              size="lg"
              class="w-full"
            />
          </div>
          
          <!-- Manager Checkbox -->
          <div class="flex items-end pb-2">
             <UCheckbox 
                v-model="newMember.isManager" 
                label="Là người quản lý (Trưởng phòng/Leader)" 
                class="cursor-pointer"
             />
          </div>
        </div>

        <!-- Department Selection - Block Style -->
        <div class="space-y-3">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Chọn Phòng ban <span class="text-red-500">*</span>
          </label>
          
          <div v-if="departments.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div 
              v-for="dept in departments" 
              :key="dept.id"
              @click="newMember.departmentId = dept.id"
              class="relative group cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ease-in-out flex flex-col gap-2 hover:shadow-md"
              :class="[
                newMember.departmentId === dept.id 
                  ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 ring-1 ring-primary-500' 
                  : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary-200 dark:hover:border-primary-800'
              ]"
            >
              <!-- Icon/Header -->
              <div class="flex items-start justify-between">
                <div class="p-2 rounded-lg" :class="newMember.departmentId === dept.id ? 'bg-primary-100 dark:bg-primary-800 text-primary-600 dark:text-primary-200' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'">
                  <UIcon name="i-heroicons-building-office" class="w-6 h-6" />
                </div>
                
                <!-- Selected Checkmark -->
                <div v-if="newMember.departmentId === dept.id" class="text-primary-500">
                  <UIcon name="i-heroicons-check-circle-solid" class="w-6 h-6" />
                </div>
              </div>

              <!-- Content -->
              <div>
                <h4 class="font-bold text-gray-900 dark:text-white" :class="{'text-primary-700 dark:text-primary-400': newMember.departmentId === dept.id}">
                  {{ dept.name }}
                </h4>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {{ dept.description }}
                </p>
              </div>
            </div>
          </div>
          <div v-else class="p-8 text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
             <UIcon name="i-heroicons-building-office-2" class="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
             <p class="text-gray-600 dark:text-gray-400 font-medium mb-1">Chưa có phòng ban nào</p>
             <p class="text-sm text-gray-500 mb-4">Bạn cần tạo phòng ban trước khi thêm nhân viên.</p>
             <UButton to="/departments" color="primary" variant="solid" icon="i-heroicons-plus-circle">
                Đi đến quản lý Phòng ban
             </UButton>
          </div>
        </div>

        <!-- Submit Action -->
        <div class="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
          <UButton 
            type="submit" 
            color="primary" 
            size="lg"
            :loading="isCreating"
            :disabled="!newMember.name || !newMember.departmentId || !newMember.username || !newMember.password"
            icon="i-heroicons-paper-airplane"
          >
            Thêm nhân viên
          </UButton>
        </div>
      </form>
    </UCard>

    <!-- 2. Members List -->
    <UCard class="ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm overflow-hidden">
      <template #header>
        <div class="px-3 py-3 sm:px-6 sm:py-4 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Danh sách Nhân viên ({{ members.length }})</h3>
          
          <UInput 
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Tìm kiếm nhân viên..."
            size="sm"
            color="neutral"
            class="w-64"
          />
        </div>
      </template>

      <!-- Table View -->
      <!-- Desktop Table View -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th scope="col" class="px-3 py-3 sm:px-6 font-medium">Nhân viên</th>
              <th scope="col" class="px-3 py-3 sm:px-6 font-medium">Tài khoản & Liên hệ</th>
              <th scope="col" class="px-3 py-3 sm:px-6 font-medium">Phòng ban</th>
              <th scope="col" class="px-3 py-3 sm:px-6 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="member in filteredMembers" :key="member.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <td class="px-3 py-3 sm:px-6 sm:py-4 font-medium text-gray-900 dark:text-white">
                <div class="flex items-center gap-3">
                  <UAvatar 
                    :alt="member.name"
                    size="md"
                    class="ring-1 ring-gray-200 dark:ring-gray-700"
                  />
                  <div>
                    <div class="text-base font-semibold flex items-center gap-2">
                       {{ member.name }}
                       <UIcon v-if="member.role === 'Leader'" name="i-heroicons-star" class="w-4 h-4 text-yellow-500" />
                    </div>
                    <!-- Username with Copy -->
                    <div class="text-xs text-gray-500 flex items-center gap-1 mt-0.5 group cursor-pointer" @click="copyToClipboard(member.username || '', 'Đã sao chép tên đăng nhập')">
                       <UIcon name="i-heroicons-at-symbol" class="w-3 h-3" />
                       <span class="font-mono group-hover:text-primary-500 transition-colors">{{ member.username }}</span>
                       <UIcon name="i-heroicons-document-duplicate" class="w-3 h-3 opacity-0 group-hover:opacity-100 text-gray-400 group-hover:text-primary-500 transition-opacity" />
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3 sm:px-6 sm:py-4">
                <div class="space-y-2">
                   <!-- Password Reveal/Copy -->
                   <div class="flex items-center gap-2 p-1.5 -ml-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800/50 group w-fit transition-colors">
                      <div class="flex items-center gap-2 text-gray-600 dark:text-gray-300 text-xs">
                         <UIcon name="i-heroicons-key" class="w-4 h-4 text-gray-400" />
                         <span class="font-mono bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500">••••••</span>
                      </div>
                      <UButton 
                        size="xs" 
                        color="neutral" 
                        variant="ghost" 
                        icon="i-heroicons-document-duplicate" 
                        class="opacity-0 group-hover:opacity-100 transition-opacity"
                        @click="copyToClipboard(member.password || '', 'Đã sao chép mật khẩu')"
                      />
                   </div>

                  <hr class="border-gray-100 dark:border-gray-800 w-full" v-if="member.email || member.phone" />

                  <div v-if="member.email" class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-gray-400" />
                    <span class="text-sm select-all">{{ member.email }}</span>
                  </div>
                  <div v-if="member.phone" class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <UIcon name="i-heroicons-phone" class="w-4 h-4 text-gray-400" />
                    <span class="text-sm select-all">{{ member.phone }}</span>
                  </div>
                </div>
              </td>
              <td class="px-3 py-3 sm:px-6 sm:py-4">
                <UBadge color="neutral" variant="soft" size="sm">
                  <UIcon name="i-heroicons-building-office" class="w-4 h-4 mr-1" />
                  {{ getDepartmentName(member.department_id) }}
                </UBadge>
              </td>
              <td class="px-3 py-3 sm:px-6 sm:py-4 text-right">
                <UButton icon="i-heroicons-pencil-square" size="sm" color="neutral" variant="ghost" @click="openEditModal(member)" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile List View -->
      <div class="sm:hidden space-y-3 p-3 pt-0">
         <div 
            v-for="member in filteredMembers" 
            :key="'mobile-mem-' + member.id"
            class="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3"
         >
            <!-- Header: Avatar + Info + Action -->
            <div class="flex items-start justify-between">
               <div class="flex items-center gap-3">
                  <UAvatar :alt="member.name" size="md" />
                  <div>
                     <div class="flex items-center gap-1.5">
                        <span class="font-bold text-gray-900 dark:text-white">{{ member.name }}</span>
                        <UIcon v-if="member.role === 'Leader'" name="i-heroicons-star" class="w-4 h-4 text-yellow-500" />
                     </div>
                     <div class="text-xs text-gray-500 mt-0.5">{{ getDepartmentName(member.department_id) }}</div>
                  </div>
               </div>
               <UButton icon="i-heroicons-pencil-square" size="xs" color="neutral" variant="ghost" @click="openEditModal(member)" />
            </div>

            <div class="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

            <!-- Credentials Grid -->
            <div class="grid grid-cols-2 gap-3 text-sm">
               <!-- Username -->
               <div class="col-span-1" @click="copyToClipboard(member.username || '', 'Đã sao chép username')">
                  <span class="text-xs text-gray-500 block">Username</span>
                  <div class="font-mono bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 mt-1 text-gray-700 dark:text-gray-300 w-full truncate flex items-center justify-between group">
                     {{ member.username }}
                     <UIcon name="i-heroicons-document-duplicate" class="w-3 h-3 text-gray-400" />
                  </div>
               </div>
               <!-- Password -->
               <div class="col-span-1" @click="copyToClipboard(member.password || '', 'Đã sao chép mật khẩu')">
                  <span class="text-xs text-gray-500 block">Password</span>
                  <div class="font-mono bg-gray-50 dark:bg-gray-800 rounded px-2 py-1 mt-1 text-gray-700 dark:text-gray-300 w-full truncate flex items-center justify-between group">
                     ••••••
                     <UIcon name="i-heroicons-document-duplicate" class="w-3 h-3 text-gray-400" />
                  </div>
               </div>
            </div>

            <!-- Contacts -->
            <div v-if="member.email || member.phone" class="space-y-1 pt-1">
               <div v-if="member.email" class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <UIcon name="i-heroicons-envelope" class="w-3.5 h-3.5 text-gray-400" />
                  <span>{{ member.email }}</span>
               </div>
               <div v-if="member.phone" class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <UIcon name="i-heroicons-phone" class="w-3.5 h-3.5 text-gray-400" />
                  <span>{{ member.phone }}</span>
               </div>
            </div>
         </div>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredMembers.length === 0" class="p-12 text-center text-gray-500">
         <UIcon name="i-heroicons-users" class="w-12 h-12 mx-auto mb-4 text-gray-300" />
         <p>Không tìm thấy nhân viên nào.</p>
      </div>
    </UCard>

    <!-- Edit Member Modal -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="isEditModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style="background-color: rgba(0,0,0,0.5);">
        <div class="absolute inset-0" @click="isEditModalOpen = false"></div>

        <div class="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col ring-1 ring-gray-200 dark:ring-gray-800">
          <div class="px-3 py-3 sm:px-6 sm:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              Cập nhật hồ sơ nhân viên
            </h3>
            <button @click="isEditModalOpen = false" class="text-gray-400 hover:text-gray-500 focus:outline-none">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>

          <div class="p-3 sm:p-6 space-y-4">
            <!-- Non-editable Department Info -->
            <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span class="text-sm text-gray-500">Phòng ban hiện tại:</span>
              <UBadge color="neutral" variant="solid">{{ getDepartmentName(editingMember.departmentId) }}</UBadge>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Họ và tên <span class="text-red-500">*</span></label>
                <UInput v-model="editingMember.name" size="lg" autofocus class="w-full"/>
              </div>
               <!-- Username Readonly/Editable? Usually username is fixed or editable. User asked to be able to input. Let's make it editable but maybe distinct. -->
               <!-- Username Readonly/Editable? Usually username is fixed or editable. User asked to be able to input. Let's make it editable but maybe distinct. -->
                  <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên đăng nhập</label>
                     <UInput v-model="editingMember.username" size="lg" class="w-full" icon="i-heroicons-at-symbol"/>
                  </div>
                  <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu mới</label>
                     <UInput
                       v-model="editingMember.password"
                       :type="showEditPassword ? 'text' : 'password'"
                       size="lg"
                       class="w-full"
                       icon="i-heroicons-lock-closed"
                       placeholder="Để trống nếu không đổi"
                       :ui="{ leading: 'pointer-events-none' }"
                     >
                       <template #trailing>
                         <UButton
                           color="neutral"
                           variant="ghost"
                           icon="i-heroicons-eye"
                           :padded="false"
                           :class="{ 'text-gray-400': !showEditPassword, 'text-primary-500': showEditPassword }"
                           @click="showEditPassword = !showEditPassword"
                         />
                       </template>
                     </UInput>
                  </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <UInput v-model="editingMember.email" size="lg" class="w-full"/>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                  <UInput v-model="editingMember.phone" size="lg" class="w-full"/>
                </div>
              </div>
              
              <div>
                 <UCheckbox 
                    v-model="editingMember.isManager" 
                    label="Là người quản lý" 
                    class="cursor-pointer"
                 />
              </div>
            </div>
          </div>

          <div class="px-3 py-3 sm:px-6 sm:py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
             <UButton color="neutral" variant="ghost" @click="isEditModalOpen = false">Hủy bỏ</UButton>
             <UButton color="primary" @click="updateMember">Lưu thay đổi</UButton>
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
  title: 'Quản lý Nhân sự - SheetVN'
})

// --- State ---
// --- State ---
const searchQuery = ref('')
const isCreating = ref(false)
const isEditModalOpen = ref(false)
const showCreatePassword = ref(true)
const showEditPassword = ref(true)

const newMember = reactive({
  name: '',
  username: '',
  password: '',
  email: '',
  phone: '',
  departmentId: null as string | null,
  isManager: false
})

const editingMember = reactive({
  id: '' as string | number,
  name: '',
  username: '',
  password: '', 
  email: '',
  phone: '',
  departmentId: '' as string,
  isManager: false
})

// Auto-generate username
watch(() => newMember.name, (val) => {
  if (val) {
    // Basic slugify: lowercase, remove accents, remove spaces
    newMember.username = val
      .toLowerCase()
      .normalize('NFD') // separate accents
      .replace(/[\u0300-\u036f]/g, '') // remove accents
      .replace(/\s+/g, '') // remove spaces
      .replace(/[^a-z0-9]/g, '') // remove non-alphanumeric
  }
})

// --- Interfaces (matching DB/API) ---
// Note: These should ideally be imported from shared types, but defining locally for SFC completeness as requested or typically done in quick Vue setups.

interface Department {
  id: string
  name: string
  description?: string
  license_key: string
  created_at: string
}

interface Member {
  id: string
  name: string
  username?: string // Added loosely for UI
  password?: string // Added for display/copy (security caveat noted)
  email?: string
  phone?: string
  avatar?: string
  role: 'Leader' | 'Member'
  department_id: string
  license_key: string
  created_at: string
}

const copyToClipboard = (text: string, successMessage: string) => {
  if (!text) return
  navigator.clipboard.writeText(text)
  toast.add({ title: 'Đã sao chép', description: successMessage, color: 'success' })
}

// --- Data Fetching ---
// 1. Get Departments for selection
const { data: deptData } = await useFetch<Department[]>('/api/departments')
const departments = computed(() => deptData.value || [])

// Auto-select department if only one is available (e.g. for Leaders)
watch(() => departments.value, (newDepts) => {
  if (newDepts.length === 1 && newDepts[0]) {
    newMember.departmentId = newDepts[0].id
  }
}, { immediate: true })

// 2. Get Members
const { data: membersData, refresh: refreshMembers } = await useFetch<Member[]>('/api/members')
const members = computed<Member[]>(() => membersData.value || [])

// --- Computed ---
const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  const query = searchQuery.value.toLowerCase()
  return members.value.filter(m => 
    m.name.toLowerCase().includes(query) || 
    (m.username && m.username.toLowerCase().includes(query)) ||
    (m.email && m.email.toLowerCase().includes(query)) ||
    (m.phone && m.phone.includes(query))
  )
})

// --- Helpers ---
const getDepartmentName = (id: string | number) => {
  const dept = departments.value.find(d => d.id === id)
  return dept ? dept.name : 'Không xác định'
}

// --- Actions ---
const toast = useToast()

const createMember = async () => {
  if (!newMember.name || !newMember.departmentId || !newMember.username || !newMember.password) return
  
  isCreating.value = true
  try {
    await $fetch('/api/members', {
      method: 'POST',
      body: {
        name: newMember.name,
        username: newMember.username,
        password: newMember.password,
        email: newMember.email,
        phone: newMember.phone,
        department_id: newMember.departmentId,
        isManager: newMember.isManager
      }
    })

    toast.add({ title: 'Thành công', description: 'Đã thêm nhân viên mới', color: 'success' })
    
    // Reset
    newMember.name = ''
    newMember.username = ''
    newMember.password = ''
    newMember.email = ''
    newMember.phone = ''
    newMember.isManager = false
    newMember.departmentId = null
    
    await refreshMembers()

  } catch (error: any) {
    toast.add({ 
       title: 'Lỗi', 
       description: error.data?.message || 'Không thể tạo nhân viên', 
       color: 'error' 
    })
  } finally {
    isCreating.value = false
  }
}

const openEditModal = (member: Member) => {
  editingMember.id = member.id
  editingMember.name = member.name
  editingMember.username = member.username || ''
  editingMember.email = member.email || ''
  editingMember.phone = member.phone || ''
  editingMember.departmentId = member.department_id
  editingMember.isManager = member.role === 'Leader'
  editingMember.password = '' 
  isEditModalOpen.value = true
}

const updateMember = async () => {
  try {
    await $fetch(`/api/members/${editingMember.id}`, {
      method: 'PUT',
      body: {
        name: editingMember.name,
        email: editingMember.email,
        phone: editingMember.phone,
        isManager: editingMember.isManager,
        password: editingMember.password || undefined // Only send if not empty
      }
    })

    toast.add({ title: 'Thành công', description: 'Đã cập nhật hồ sơ', color: 'success' })
    await refreshMembers()
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
