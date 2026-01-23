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
        <div class="px-6 py-4">
          <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UIcon name="i-heroicons-user-plus" class="w-5 h-5 text-primary-500" />
            Thêm Nhân viên Mới
          </h3>
        </div>
      </template>
      
      <form @submit.prevent="createMember" class="p-6 space-y-6">
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
              type="password"
              placeholder="••••••"
              icon="i-heroicons-lock-closed"
              size="lg"
              class="w-full"
            />
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
          
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div class="px-6 py-4 flex justify-between items-center">
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
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th scope="col" class="px-6 py-3 font-medium">Nhân viên</th>
              <th scope="col" class="px-6 py-3 font-medium">Thông tin liên hệ</th>
              <th scope="col" class="px-6 py-3 font-medium">Phòng ban</th>
              <th scope="col" class="px-6 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="member in filteredMembers" :key="member.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <td class="px-6 py-4 font-medium text-gray-900 dark:text-white">
                <div class="flex items-center gap-3">
                  <UAvatar 
                    :alt="member.name"
                    size="md"
                    class="ring-1 ring-gray-200 dark:ring-gray-700"
                  />
                  <div>
                    <div class="text-base font-semibold flex items-center gap-2">
                       {{ member.name }}
                       <UIcon v-if="member.isManager" name="i-heroicons-star" class="w-4 h-4 text-yellow-500" />
                    </div>
                    <div class="text-xs text-gray-400">@{{ member.username }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="space-y-1">
                  <div v-if="member.email" class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <UIcon name="i-heroicons-envelope" class="w-4 h-4 text-gray-400" />
                    <span>{{ member.email }}</span>
                  </div>
                  <div v-if="member.phone" class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <UIcon name="i-heroicons-phone" class="w-4 h-4 text-gray-400" />
                    <span>{{ member.phone }}</span>
                  </div>
                  <div v-if="!member.email && !member.phone" class="text-gray-400 italic text-xs">
                    Chưa cập nhật thông tin
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <UBadge color="neutral" variant="soft" size="sm">
                  <UIcon name="i-heroicons-building-office" class="w-4 h-4 mr-1" />
                  {{ getDepartmentName(member.departmentId) }}
                </UBadge>
              </td>
              <td class="px-6 py-4 text-right">
                <UButton icon="i-heroicons-pencil-square" size="sm" color="neutral" variant="ghost" @click="openEditModal(member)" />
              </td>
            </tr>
          </tbody>
        </table>
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
          <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 class="text-base font-semibold text-gray-900 dark:text-white">
              Cập nhật hồ sơ nhân viên
            </h3>
            <button @click="isEditModalOpen = false" class="text-gray-400 hover:text-gray-500 focus:outline-none">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 space-y-4">
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
              <div class="grid grid-cols-2 gap-4">
                 <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên đăng nhập</label>
                    <UInput v-model="editingMember.username" size="lg" class="w-full" icon="i-heroicons-at-symbol"/>
                 </div>
                 <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu mới</label>
                    <UInput v-model="editingMember.password" type="password" size="lg" class="w-full" icon="i-heroicons-lock-closed" placeholder="Để trống nếu không đổi"/>
                 </div>
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

          <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800">
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
const searchQuery = ref('')
const isCreating = ref(false)
const isEditModalOpen = ref(false)

const newMember = reactive({
  name: '',
  username: '',
  password: '',
  email: '',
  phone: '',
  departmentId: null as number | null,
  isManager: false
})

const editingMember = reactive({
  id: 0,
  name: '',
  username: '',
  password: '', // plaintext for display/edit sake in this mock
  email: '',
  phone: '',
  departmentId: 0,
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

// --- Mock Data ---
interface Department {
  id: number
  name: string
  description: string
}

interface Member {
  id: number
  name: string
  username: string
  email: string
  phone: string
  departmentId: number
  isManager: boolean
}

// Consistent with Departments page
const departments = ref<Department[]>([
  { id: 1, name: 'Phòng Kinh Doanh', description: 'Chịu trách nhiệm doanh số và thị trường' },
  { id: 2, name: 'Marketing', description: 'Quảng bá thương hiệu và truyền thông' },
  { id: 3, name: 'Kỹ Thuật & IT', description: 'Phát triển và bảo trì hệ thống cho công ty' },
  { id: 4, name: 'Nhân Sự (HR)', description: 'Tuyển dụng và đào tạo nhân sự' }
])

// Some Initial Mock Members
const members = ref<Member[]>([
  { id: 101, name: 'Nguyễn Văn A', username: 'nguyenvana', email: 'vana@gmail.com', phone: '0912345678', departmentId: 1, isManager: true },
  { id: 102, name: 'Trần Thị B', username: 'tranthib', email: 'thib@gmail.com', phone: '0987654321', departmentId: 1, isManager: false },
  { id: 103, name: 'Ngô Văn G', username: 'ngovang', email: '', phone: '0909090909', departmentId: 2, isManager: true },
  { id: 104, name: 'Lý Văn I', username: 'lyvani', email: 'lyvani@tech.com', phone: '', departmentId: 3, isManager: false },
])

// --- Computed ---
const filteredMembers = computed(() => {
  if (!searchQuery.value) return members.value
  const query = searchQuery.value.toLowerCase()
  return members.value.filter(m => 
    m.name.toLowerCase().includes(query) || 
    m.username.toLowerCase().includes(query) ||
    m.email.toLowerCase().includes(query) ||
    m.phone.includes(query)
  )
})

// --- Helpers ---
const getDepartmentName = (id: number) => {
  const dept = departments.value.find(d => d.id === id)
  return dept ? dept.name : 'Không xác định'
}

// --- Actions ---
const createMember = async () => {
  if (!newMember.name || !newMember.departmentId || !newMember.username || !newMember.password) return
  
  isCreating.value = true
  
  // Simulate API
  await new Promise(resolve => setTimeout(resolve, 600))
  
  members.value.unshift({
    id: Date.now(),
    name: newMember.name,
    username: newMember.username,
    email: newMember.email,
    phone: newMember.phone,
    departmentId: newMember.departmentId,
    isManager: newMember.isManager
  })
  
  // Reset
  newMember.name = ''
  newMember.username = ''
  newMember.password = ''
  newMember.email = ''
  newMember.phone = ''
  newMember.isManager = false
  newMember.departmentId = null
  
  isCreating.value = false
}

const openEditModal = (member: Member) => {
  editingMember.id = member.id
  editingMember.name = member.name
  editingMember.username = member.username
  editingMember.email = member.email
  editingMember.phone = member.phone
  editingMember.departmentId = member.departmentId
  editingMember.isManager = member.isManager
  editingMember.password = '' // Don't show old password
  isEditModalOpen.value = true
}

const updateMember = () => {
  const member = members.value.find(m => m.id === editingMember.id)
  if (member) {
    member.name = editingMember.name
    member.username = editingMember.username
    member.email = editingMember.email
    member.phone = editingMember.phone
    member.isManager = editingMember.isManager
    // In real app, only update password if provided
  }
  isEditModalOpen.value = false
}
</script>
