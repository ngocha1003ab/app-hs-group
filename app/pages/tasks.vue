<template>
  <div class="max-w-7xl mx-auto space-y-8">
    <!-- Page Header -->
    <div>
      <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Quản lý Nhiệm vụ
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">
        Tạo mới và phân công nhiệm vụ cho nhân viên.
      </p>
    </div>

    <!-- 1. Create Task Section -->
    <!-- 1. Create Task Section -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div class="p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-heroicons-plus-circle" class="w-5 h-5 text-primary-500" />
          Tạo nhiệm vụ mới
        </h3>
      </div>
      
      <form @submit.prevent="createTask" class="p-6 space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column: Basic Info -->
          <div class="space-y-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tên nhiệm vụ <span class="text-red-500">*</span></label>
              <UInput class="w-full" v-model="newTask.title" placeholder="Nhập tên nhiệm vụ..." size="lg" icon="i-heroicons-clipboard-document-list" />
            </div>
            
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Miêu tả chi tiết</label>
              <UTextarea class="w-full" v-model="newTask.description" placeholder="Mô tả công việc cần làm..." :rows="4" />
            </div>
          </div>

          <!-- Right Column: Assignment & Meta -->
          <div class="space-y-6">
            <!-- Assignee Picker with Input & Dropdown -->
            <div class="space-y-2 relative" ref="assigneeDropdownRef">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Giao cho ai <span class="text-red-500">*</span></label>
              
              <UInput 
                v-model="assigneeSearchQuery"
                placeholder="Nhập tên nhân viên để tìm kiếm..."
                size="lg"
                icon="i-heroicons-user"
                class="w-full"
                @focus="isAssigneeDropdownOpen = true"
                @input="handleAssigneeSearchInput"
                autocomplete="off"
              >
                 <template #trailing>
                    <UIcon v-if="newTask.assigneeId" name="i-heroicons-check-circle" class="w-5 h-5 text-green-500" />
                 </template>
              </UInput>

              <!-- Dropdown Content -->
              <div 
                v-if="isAssigneeDropdownOpen"
                class="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 min-w-[300px]"
              >
                <!-- Department Tabs -->
                <div class="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <div class="flex gap-2 overflow-x-auto no-scrollbar">
                    <button 
                      type="button"
                      @click="assigneeDeptFilter = 'all'"
                      class="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors"
                      :class="assigneeDeptFilter === 'all' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'bg-white dark:bg-gray-800 text-gray-600 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'"
                    >
                      Tất cả
                    </button>
                    <button 
                      v-for="dept in departments" 
                      :key="dept.id"
                      type="button"
                      @click="assigneeDeptFilter = dept.id"
                      class="px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors"
                       :class="assigneeDeptFilter === dept.id ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'bg-white dark:bg-gray-800 text-gray-600 border border-gray-200 dark:border-gray-700 hover:bg-gray-50'"
                    >
                      {{ dept.name }}
                    </button>
                  </div>
                </div>

                <!-- List -->
                <div class="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  <div 
                    v-for="emp in filteredEmployees" 
                    :key="emp.id"
                    @click="selectAssignee(emp)"
                    class="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                    :class="{'bg-primary-50 dark:bg-primary-900/20': newTask.assigneeId === emp.id}"
                  >
                    <UAvatar :src="emp.avatar" :alt="emp.name" size="sm" />
                    <div class="flex-1">
                      <div class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{{ emp.name }}</div>
                      <div class="text-xs text-gray-500">{{ emp.departmentName }}</div>
                    </div>
                    <UIcon v-if="newTask.assigneeId === emp.id" name="i-heroicons-check" class="w-5 h-5 text-primary-500" />
                  </div>
                  <div v-if="filteredEmployees.length === 0" class="p-4 text-center text-gray-500 text-sm italic">
                    Không tìm thấy nhân viên phù hợp.
                  </div>
                </div>
              </div>
            </div>

            <!-- Priority & DueDate -->
            <div class="grid grid-cols-2 gap-6">
               <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Độ ưu tiên</label>
                  <div class="flex gap-2">
                    <button 
                      type="button" 
                      v-for="p in priorities" 
                      :key="p.value"
                      @click="newTask.priority = p.value"
                      class="flex-1 flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all"
                      :class="newTask.priority === p.value ? p.activeClass : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:border-gray-200'"
                    >
                       <span class="text-xs font-bold">{{ p.label }}</span>
                    </button>
                  </div>
               </div>
               
               <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hạn hoàn thành</label>
                  <UInput v-model="newTask.dueDate" type="date" size="lg" icon="i-heroicons-calendar" />
               </div>
            </div>
          </div>
        </div>

        <div class="pt-4 flex justify-end border-t border-gray-100 dark:border-gray-800">
          <UButton 
            type="submit" 
            size="lg" 
            color="primary" 
            icon="i-heroicons-paper-airplane"
            :loading="isSubmitting"
            :disabled="!newTask.title || !newTask.assigneeId || !newTask.dueDate"
          >
            Giao nhiệm vụ
          </UButton>
        </div>
      </form>
    </div>

    <!-- 2. Task List Section -->
    <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
      <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Danh sách Nhiệm vụ ({{ tasks.length }})</h3>
        <UInput v-model="taskListSearch" icon="i-heroicons-magnifying-glass" placeholder="Tìm tên nhiệm vụ..." size="sm" color="neutral" />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="px-6 py-3 font-medium">Nhiệm vụ</th>
              <th class="px-6 py-3 font-medium">Người thực hiện</th>
              <th class="px-6 py-3 font-medium">Hạn chót</th>
              <th class="px-6 py-3 font-medium">Ưu tiên</th>
              <th class="px-6 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="task in filteredTasks" :key="task.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <td class="px-6 py-4">
                 <div class="font-semibold text-gray-900 dark:text-white">{{ task.title }}</div>
                 <div class="text-xs text-gray-500 line-clamp-1 mt-0.5">{{ task.description }}</div>
              </td>
              <td class="px-6 py-4">
                 <div class="flex items-center gap-2">
                    <UAvatar :src="getEmployee(task.assigneeId)?.avatar" size="2xs" />
                    <span class="text-gray-700 dark:text-gray-300">{{ getEmployee(task.assigneeId)?.name }}</span>
                 </div>
              </td>
              <td class="px-6 py-4">
                 <span :class="isOverdue(task.dueDate) ? 'text-red-500 font-medium' : 'text-gray-600'">
                    {{ formatDate(task.dueDate) }}
                 </span>
                 <div v-if="isOverdue(task.dueDate)" class="text-[10px] text-red-500 font-bold uppercase">Quá hạn</div>
              </td>
               <td class="px-6 py-4">
                 <UBadge :color="priorityBadge(task.priority).color" variant="subtle" size="xs">
                    {{ priorityBadge(task.priority).label }}
                 </UBadge>
              </td>
              <td class="px-6 py-4 text-right">
                 <UButton icon="i-heroicons-pencil-square" size="sm" color="neutral" variant="ghost" @click="openEditModal(task)" />
              </td>
            </tr>
            <tr v-if="filteredTasks.length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                Chưa có nhiệm vụ nào.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal (Custom HTML/CSS) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >

      <div v-if="isEditModalOpen" class="fixed inset-0 z-[100] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
         <div class="fixed inset-0 bg-gray-500/75 transition-opacity" @click="isEditModalOpen = false"></div>
         
         <div class="flex min-h-full items-center justify-center p-4">
            <div class="relative w-full max-w-lg transform rounded-xl bg-white dark:bg-gray-900 p-6 text-left shadow-2xl transition-all border border-gray-100 dark:border-gray-700">
               <!-- Header -->
               <div class="flex items-center justify-between mb-6">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">Cập nhật Nhiệm vụ</h3>
                  <button @click="isEditModalOpen = false" class="text-gray-400 hover:text-gray-500">
                     <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
                  </button>
               </div>
               
               <!-- Body -->
               <div class="space-y-4">
                  <div>
                     <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tên nhiệm vụ</label>
                     <UInput class="w-full" v-model="editingTask.title" />
                  </div>
                  <div>
                     <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Miêu tả</label>
                     <UTextarea class="w-full" v-model="editingTask.description" :rows="3" />
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Độ ưu tiên</label>
                        <div class="flex gap-2">
                          <button 
                            type="button" 
                            v-for="p in priorities" 
                            :key="p.value"
                            @click="editingTask.priority = p.value"
                            class="flex-1 flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all"
                            :class="editingTask.priority === p.value ? p.activeClass : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:border-gray-200'"
                          >
                             <span class="text-xs font-bold">{{ p.label }}</span>
                          </button>
                        </div>
                     </div>
                     <div>
                        <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Hạn chót</label>
                        <UInput v-model="editingTask.dueDate" type="date" />
                     </div>
                  </div>
               </div>
               
               <!-- Footer -->
               <div class="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <UButton color="neutral" variant="ghost" @click="isEditModalOpen = false">Hủy bỏ</UButton>
                  <UButton color="primary" @click="updateTask" :loading="isSubmitting">Lưu thay đổi</UButton>
               </div>
            </div>
         </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'app'
})

useHead({
  title: 'Quản lý Nhiệm vụ - SheetVN'
})

// --- Types ---
interface Employee {
  id: number
  name: string
  avatar: string
  departmentId: number
  departmentName: string
}

interface Department {
  id: number
  name: string
}

interface Task {
  id: number
  title: string
  description: string
  assigneeId: number | null
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  status: 'todo' | 'in-progress' | 'done'
}

type Priority = 'low' | 'medium' | 'high'

// --- Mock Data ---
const departments: Department[] = [
  { id: 1, name: 'Phòng Kinh Doanh' },
  { id: 2, name: 'Marketing' },
  { id: 3, name: 'Kỹ Thuật & IT' },
  { id: 4, name: 'Nhân Sự (HR)' }
]

const employees: Employee[] = [
  { id: 101, name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=1', departmentId: 1, departmentName: 'Phòng Kinh Doanh' },
  { id: 102, name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=2', departmentId: 1, departmentName: 'Phòng Kinh Doanh' },
  { id: 103, name: 'Ngô Văn G', avatar: 'https://i.pravatar.cc/150?u=7', departmentId: 2, departmentName: 'Marketing' },
  { id: 104, name: 'Vũ Thị K', avatar: 'https://i.pravatar.cc/150?u=10', departmentId: 3, departmentName: 'Kỹ Thuật & IT' },
  { id: 105, name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?u=4', departmentId: 4, departmentName: 'Nhân Sự (HR)' },
]

const priorities: { value: Priority, label: string, activeClass: string }[] = [
  { value: 'high', label: 'Cao', activeClass: 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30' },
  { value: 'medium', label: 'Trung bình', activeClass: 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/30' },
  { value: 'low', label: 'Thấp', activeClass: 'border-gray-500 bg-gray-100 text-gray-700 dark:bg-gray-700/50' }
]

const priorityOptions = [
  { label: 'Thấp', value: 'low' },
  { label: 'Trung bình', value: 'medium' },
  { label: 'Cao', value: 'high' }
]

const tasks = ref<Task[]>([
  { id: 1, title: 'Chuẩn bị tài liệu họp', description: 'Chuẩn bị slide và báo cáo tuần.', assigneeId: 101, priority: 'high', dueDate: '2023-10-30', status: 'todo' },
  { id: 2, title: 'Thiết kế banner sự kiện', description: '', assigneeId: 103, priority: 'medium', dueDate: '2023-11-05', status: 'done' },
])

// --- State ---
const isSubmitting = ref(false)
const isAssigneeDropdownOpen = ref(false)
const assigneeDropdownRef = ref<HTMLElement | null>(null)
const assigneeSearchQuery = ref('')
const assigneeDeptFilter = ref<number | 'all'>('all')
const taskListSearch = ref('')

const isEditModalOpen = ref(false)
const editingTask = reactive<Task>({
   id: 0, title: '', description: '', assigneeId: null, priority: 'medium', dueDate: '', status: 'todo'
})

const newTask = reactive({
  title: '',
  description: '',
  assigneeId: null as number | null,
  priority: 'medium' as Priority,
  dueDate: ''
})

// --- Computed ---
const filteredEmployees = computed(() => {
  let list = employees
  
  if (assigneeDeptFilter.value !== 'all') {
    list = list.filter(e => e.departmentId === assigneeDeptFilter.value)
  }
  
  if (assigneeSearchQuery.value) {
    const q = assigneeSearchQuery.value.toLowerCase()
    list = list.filter(e => e.name.toLowerCase().includes(q))
  }
  
  return list
})

const selectedAssignee = computed(() => {
  return employees.find(e => e.id === newTask.assigneeId)
})

const filteredTasks = computed(() => {
   if(!taskListSearch.value) return tasks.value
   const q = taskListSearch.value.toLowerCase()
   return tasks.value.filter(t => t.title.toLowerCase().includes(q))
})

// --- Helpers ---
const formatDate = (date: string) => {
   if(!date) return ''
   return new Date(date).toLocaleDateString('vi-VN')
}

const isOverdue = (date: string) => {
   const d = new Date(date)
   const today = new Date()
   today.setHours(0,0,0,0)
   return d < today
}

const getEmployee = (id: number | null) => employees.find(e => e.id === id)

const priorityBadge = (p: Priority) => {
   switch(p) {
      case 'high': return { label: 'Cao', color: 'error' as const }
      case 'medium': return { label: 'Trung bình', color: 'warning' as const }
      case 'low': return { label: 'Thấp', color: 'neutral' as const }
   }
}

// --- Actions ---
const selectAssignee = (emp: Employee) => {
  newTask.assigneeId = emp.id
  assigneeSearchQuery.value = emp.name
  isAssigneeDropdownOpen.value = false
}

const handleAssigneeSearchInput = () => {
  // If user types, we clear the selected ID unless they re-select
  if (newTask.assigneeId) {
     const selected = employees.find(e => e.id === newTask.assigneeId)
     if (selected && selected.name !== assigneeSearchQuery.value) {
        newTask.assigneeId = null
     }
  }
}

const createTask = async () => {
   if(!newTask.title || !newTask.assigneeId || !newTask.dueDate) return
   console.log("Creating Task", newTask)
   isSubmitting.value = true
   
   await new Promise(resolve => setTimeout(resolve, 600))
   
   tasks.value.unshift({
      id: Date.now(),
      title: newTask.title,
      description: newTask.description,
      assigneeId: newTask.assigneeId,
      priority: newTask.priority,
      dueDate: newTask.dueDate,
      status: 'todo'
   })
   
   // Reset
   newTask.title = ''
   newTask.description = ''
   newTask.assigneeId = null
   assigneeSearchQuery.value = ''
   newTask.priority = 'medium'
   newTask.dueDate = ''
   
   isSubmitting.value = false
}

const openEditModal = (task: Task) => {
   Object.assign(editingTask, JSON.parse(JSON.stringify(task)))
   isEditModalOpen.value = true
}

const updateTask = async () => {
   const index = tasks.value.findIndex(t => t.id === editingTask.id)
   if(index !== -1) {
      isSubmitting.value = true
      await new Promise(resolve => setTimeout(resolve, 500))
      tasks.value[index] = { ...editingTask }
      isSubmitting.value = false
      isEditModalOpen.value = false
   }
}

// Click Outside Logic
const handleClickOutside = (event: MouseEvent) => {
  if (assigneeDropdownRef.value && !assigneeDropdownRef.value.contains(event.target as Node)) {
    isAssigneeDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
