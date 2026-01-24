<template>
  <div class="h-[calc(100vh-64px)] flex flex-col -m-4 sm:m-0">
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-4 sm:px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-4">
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white capitalize">
          tháng {{ currentMonth + 1 }}, {{ currentYear }}
        </h1>
        <div class="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <UButton 
            icon="i-heroicons-chevron-left" 
            color="neutral" 
            variant="ghost" 
            size="sm"
            @click="prevMonth"
          />
          <UButton 
            label="Hôm nay" 
            color="neutral" 
            variant="ghost" 
            size="sm"
            @click="goToToday"
            class="hidden sm:flex"
          />
          <UButton 
            icon="i-heroicons-chevron-right" 
            color="neutral" 
            variant="ghost" 
            size="sm"
            @click="nextMonth"
          />
        </div>
      </div>

      <!-- View Controls / Legend (Desktop) -->
      <div class="hidden sm:flex items-center gap-3">
         <div class="flex items-center gap-2 text-xs">
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Cao</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-orange-500"></span> Trung bình</span>
            <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-gray-400"></span> Thấp</span>
         </div>
         <UButton  v-if="userInfo.role !== 'Member'" label="Tạo nhiệm vụ" icon="i-heroicons-plus" color="primary" @click="openCreateModal(new Date())" />
      </div>
    </div>

    <!-- Calendar Grid Header -->
    <div class="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
      <div 
        v-for="day in weekDays" 
        :key="day" 
        class="py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid Body (Formatted as Squares) -->
    <div class="flex-1 grid grid-cols-7 bg-gray-200 dark:bg-gray-800 gap-px overflow-y-auto min-h-0">
      <div 
        v-for="(date, index) in calendarDays" 
        :key="index"
        class="relative bg-white dark:bg-gray-900 aspect-square flex flex-col p-1 sm:p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
        :class="{
          'opacity-50 bg-gray-50/50 dark:bg-gray-900/50': !isCurrentMonth(date),
          'ring-2 ring-inset ring-primary-500 z-10': isToday(date)
        }"
        @click="handleDayClick(date)"
      >
        <!-- Date Number -->
        <div class="flex items-center justify-between mb-1 sm:mb-2">
            <span 
              class="text-xs sm:text-sm font-medium w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full"
              :class="isToday(date) ? 'bg-primary-500 text-white' : 'text-gray-700 dark:text-gray-300'"
            >
              {{ date.getDate() }}
            </span>

            <!-- Mobile: Dot indicators -->
            <div class="sm:hidden flex gap-0.5">
               <div v-for="t in getTasksForDate(date).slice(0,3)" :key="t.id" 
                  class="w-1.5 h-1.5 rounded-full"
                  :class="{
                    'bg-red-500': t.priority === 'high',
                    'bg-orange-500': t.priority === 'medium',
                    'bg-gray-400': t.priority === 'low'
                  }"
               ></div>
            </div>

             <!-- Desktop: Add Button (Hover) -->
             <button 
                v-if="userInfo.role !== 'Member'"
                class="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-primary-500 hidden sm:block"
                @click.stop="openCreateModal(date)"
             >
                <UIcon name="i-heroicons-plus" class="w-4 h-4" />
             </button>
        </div>

        <!-- Tasks List (Desktop) -->
        <div class="hidden sm:flex flex-col gap-1 flex-1 overflow-y-auto custom-scrollbar">
           <div 
             v-for="task in getTasksForDate(date)" 
             :key="task.id"
             @click.stop="openEditModal(task)"
             class="px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium cursor-pointer truncate shadow-sm hover:opacity-80 transition-all border-l-2"
             :class="{
                'border-l-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300': task.priority === 'high',
                'border-l-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300': task.priority === 'medium',
                'border-l-gray-400 bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300': task.priority === 'low'
             }"
           >
              {{ task.title }}
           </div>
        </div>
      </div>
    </div>
    
    <!-- Custom Modal: Mobile Day View -->
    <div v-if="isMobileDayViewOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" @click="isMobileDayViewOpen = false"></div>
        
        <!-- Content -->
        <div class="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">
           <!-- Header -->
           <div class="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
               <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ selectedDate ? formatDateDisplay(selectedDate) : '' }}
               </h3>
               <button @click="isMobileDayViewOpen = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
               </button>
           </div>
           
           <!-- Body -->
           <div class="p-4 overflow-y-auto custom-scrollbar flex-1">
               <div v-if="selectedDateTasks.length > 0" class="space-y-3">
                   <div 
                      v-for="task in selectedDateTasks" 
                      :key="task.id"
                      @click="openEditModal(task)"
                      class="p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex gap-3 items-start cursor-pointer transition-colors active:bg-gray-100 dark:active:bg-gray-700"
                   >
                      <div 
                         class="w-2 h-2 rounded-full mt-2 shrink-0"
                         :class="{
                           'bg-red-500': task.priority === 'high',
                           'bg-orange-500': task.priority === 'medium',
                           'bg-gray-400': task.priority === 'low'
                         }"
                      ></div>
                      <div class="flex-1 min-w-0">
                         <div class="font-medium text-sm text-gray-900 dark:text-white truncate">{{ task.title }}</div>
                         <div class="text-xs text-gray-500 mt-1 line-clamp-2">{{ task.description }}</div>
                         <div class="flex flex-wrap items-center gap-2 mt-2">
                            <UBadge size="xs" color="neutral" variant="soft">{{ getEmployee(task.assigneeId)?.name }}</UBadge>
                            <UBadge :color="task.status === 'done' ? 'success' : 'neutral'" size="xs" variant="subtle">
                               {{ task.status === 'done' ? 'Hoàn thành' : (task.status === 'in-progress' ? 'Đang làm' : 'Cần làm') }}
                            </UBadge>
                         </div>
                      </div>
                   </div>
               </div>
               <div v-else class="py-12 text-center flex flex-col items-center gap-2 text-gray-500">
                   <UIcon name="i-heroicons-calendar" class="w-12 h-12 text-gray-300 dark:text-gray-700" />
                   <p>Không có nhiệm vụ nào.</p>
               </div>
           </div>

           <!-- Footer -->
           <div v-if="userInfo.role !== 'Member'" class="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
               <UButton block label="Thêm nhiệm vụ mới" icon="i-heroicons-plus" color="primary" @click="openCreateModal(selectedDate!)" />
           </div>
        </div>
    </div>

    <!-- Custom Modal: Create/Edit Task -->
    <!-- Custom Modal: Create/Edit Task -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="isModalOpen = false"></div>
        
        <!-- Content -->
        <div class="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
           <!-- Header -->
           <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
               <h3 class="text-lg font-bold text-gray-900 dark:text-white">
                 {{ isEditing ? 'Cập nhật Nhiệm vụ' : 'Tạo Nhiệm vụ mới' }}
               </h3>
               <button 
                  @click="isModalOpen = false" 
                  class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
               >
                  <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
               </button>
           </div>
           
           <!-- Form Body -->
           <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
              <form @submit.prevent="submitTask" class="space-y-5">
                 <!-- Title -->
                 <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Tên nhiệm vụ <span class="text-red-500">*</span>
                    </label>
                    <UInput 
                       v-model="form.title" 
                       placeholder="Nhập tên nhiệm vụ..." 
                       size="lg"
                       class="w-full"
                       :disabled="isEditing && userInfo.role === 'Member'"
                    />
                 </div>
                 
                 <!-- Description -->
                 <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Mô tả
                    </label>
                    <UTextarea 
                       v-model="form.description" 
                       placeholder="Mô tả chi tiết..." 
                       class="w-full"
                       :rows="3"
                       :disabled="isEditing && userInfo.role === 'Member'"
                    />
                 </div>
                 
                 <!-- Assignee Picker -->
                 <div class="relative" ref="assigneeDropdownRef">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Giao cho ai <span class="text-red-500">*</span>
                    </label>
                    
                    <UInput 
                       v-model="assigneeSearchQuery"
                       placeholder="Nhập tên nhân viên để tìm kiếm..."
                       size="lg"
                       icon="i-heroicons-user"
                       @focus="isAssigneeDropdownOpen = true"
                       @input="handleAssigneeSearchInput"
                       autocomplete="off"
                       class="w-full"
                       :disabled="isEditing && userInfo.role === 'Member'"
                    >
                       <template #trailing>
                          <UIcon v-if="form.assigneeId" name="i-heroicons-check-circle" class="w-5 h-5 text-green-500" />
                       </template>
                    </UInput>

                    <!-- Dropdown -->
                    <div 
                       v-if="isAssigneeDropdownOpen"
                       class="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden"
                    >
                       <!-- Department Tabs -->
                       <div class="p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                          <div class="flex gap-2 overflow-x-auto no-scrollbar">
                             <button 
                                type="button"
                                @click="assigneeDeptFilter = 'all'"
                                class="px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors"
                                :class="assigneeDeptFilter === 'all' 
                                   ? 'bg-primary-500 text-white' 
                                   : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
                             >
                                Tất cả
                             </button>
                             <button 
                                v-for="dept in departments" 
                                :key="dept.id"
                                type="button"
                                @click="assigneeDeptFilter = dept.id"
                                class="px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors"
                                :class="assigneeDeptFilter === dept.id 
                                   ? 'bg-primary-500 text-white' 
                                   : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'"
                             >
                                {{ dept.name }}
                             </button>
                          </div>
                       </div>

                       <!-- Employee List -->
                       <div class="max-h-60 overflow-y-auto p-2 custom-scrollbar">
                          <div 
                             v-for="emp in filteredEmployees" 
                             :key="emp.id"
                             @click="selectAssignee(emp)"
                             class="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors"
                             :class="form.assigneeId === emp.id 
                                ? 'bg-primary-50 dark:bg-primary-900/20' 
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800'"
                          >
                             <UAvatar :src="emp.avatar" :alt="emp.name" size="sm" />
                             <div class="flex-1 min-w-0">
                                <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                   {{ emp.name }}
                                </div>
                                <div class="text-xs text-gray-500 truncate">
                                   {{ emp.departmentName }}
                                </div>
                             </div>
                             <UIcon 
                                v-if="form.assigneeId === emp.id" 
                                name="i-heroicons-check" 
                                class="w-5 h-5 text-primary-500 flex-shrink-0" 
                             />
                          </div>
                          <div v-if="filteredEmployees.length === 0" class="p-8 text-center text-gray-500 text-sm">
                             Không tìm thấy nhân viên phù hợp.
                          </div>
                       </div>
                    </div>
                 </div>
                 
                 <!-- Status (only when editing) -->
                 <div v-if="isEditing">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Trạng thái
                    </label>
                    <USelect
                       v-model="form.status"
                       :options="[
                          { label: 'Cần làm', value: 'todo' },
                          { label: 'Đang làm', value: 'in-progress' },
                          { label: 'Hoàn thành', value: 'done' }
                       ]"
                       option-attribute="label"
                       size="lg"
                    />
                 </div>

                 <!-- Due Date -->
                 <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Hạn hoàn thành <span class="text-red-500">*</span>
                    </label>
                    <UInput 
                       type="date" 
                       v-model="form.dueDate" 
                       size="lg"
                       class="w-full"
                       :disabled="isEditing && userInfo.role === 'Member'"
                    />
                 </div>
                 
                 <!-- Priority -->
                 <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                       Độ ưu tiên
                    </label>
                    <div class="grid grid-cols-3 gap-2">
                       <button 
                          type="button" 
                          v-for="p in priorities" 
                          :key="p.value"
                          @click="(!isEditing || userInfo.role !== 'Member') && (form.priority = p.value)"
                          class="py-2.5 px-3 rounded-lg border text-sm font-medium transition-all"
                          :class="form.priority === p.value 
                             ? p.activeClass 
                             : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'"
                       >
                          {{ p.label }}
                       </button>
                     </div>
                  </div>

                  <!-- Category -->
                  <div>
                     <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Danh mục công việc
                     </label>
                     <div class="grid grid-cols-3 gap-2">
                        <button 
                           type="button" 
                           v-for="cat in categories" 
                           :key="cat.value"
                           @click="(!isEditing || userInfo.role !== 'Member') && (form.category = cat.value)"
                           class="flex flex-col items-center justify-center p-2 rounded-lg border text-sm font-medium transition-all"
                           :class="[
                              form.category === cat.value 
                                 ? 'ring-2 ring-primary-500 border-transparent bg-primary-50 dark:bg-primary-900/20' 
                                 : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-200 hover:bg-gray-50 dark:hover:bg-gray-700',
                              (isEditing && userInfo.role === 'Member') ? 'opacity-50 cursor-not-allowed' : ''
                           ]"
                        >
                           <UIcon :name="cat.icon" class="w-4 h-4 mb-1" :class="form.category === cat.value ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'" />
                           <span class="text-[10px] text-center" :class="form.category === cat.value ? 'text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-400'">{{ cat.label }}</span>
                        </button>
                     </div>
                  </div>
               </form>
            </div>

           <!-- Footer -->
           <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
              <UButton 
                 label="Hủy" 
                 color="neutral" 
                 variant="ghost" 
                 @click="isModalOpen = false" 
              />
              <UButton 
                 type="submit" 
                 :label="isEditing ? 'Lưu thay đổi' : 'Giao nhiệm vụ'" 
                 color="primary" 
                 :loading="isSubmitting"
                 @click="submitTask"
              />
           </div>
        </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'

definePageMeta({
  layout: 'app'
})

useHead({
  title: 'Lịch làm việc - SheetVN'
})

// --- Constants & Types ---
const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

type Category = 'video' | 'image' | 'document' | 'business' | 'design' | 'development' | 'marketing' | 'admin' | 'other'

const priorities = [
   { value: 'high', label: 'Cao', activeClass: 'bg-red-50 text-red-700 border-red-500 ring-1 ring-red-500 dark:bg-red-900/30 dark:text-red-400' },
   { value: 'medium', label: 'TB', activeClass: 'bg-orange-50 text-orange-700 border-orange-500 ring-1 ring-orange-500 dark:bg-orange-900/30 dark:text-orange-400' },
   { value: 'low', label: 'Thấp', activeClass: 'bg-gray-100 text-gray-700 border-gray-500 ring-1 ring-gray-500 dark:bg-gray-700/50 dark:text-gray-300' },
]

const categories = [
  { value: 'video' as Category, label: 'Video', icon: 'i-heroicons-video-camera' },
  { value: 'image' as Category, label: 'Hình ảnh', icon: 'i-heroicons-photo' },
  { value: 'document' as Category, label: 'Văn bản', icon: 'i-heroicons-document-text' },
  { value: 'business' as Category, label: 'Kinh doanh', icon: 'i-heroicons-briefcase' },
  { value: 'design' as Category, label: 'Thiết kế', icon: 'i-heroicons-paint-brush' },
  { value: 'development' as Category, label: 'Lập trình', icon: 'i-heroicons-code-bracket' },
  { value: 'marketing' as Category, label: 'Marketing', icon: 'i-heroicons-megaphone' },
  { value: 'admin' as Category, label: 'Hành chính', icon: 'i-heroicons-clipboard-document-list' },
  { value: 'other' as Category, label: 'Khác', icon: 'i-heroicons-ellipsis-horizontal-circle' }
]

// --- State ---
const now = new Date()
const currentMonth = ref(now.getMonth())
const currentYear = ref(now.getFullYear())
const isModalOpen = ref(false)
const isMobileDayViewOpen = ref(false)
const selectedDate = ref<Date | null>(null)
const isSubmitting = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

// Form State
const form = reactive({
   title: '',
   description: '',
   assigneeId: undefined as string | undefined, // Changed to undefined for SelectMenu
   priority: 'medium',
   category: undefined as Category | undefined,
   dueDate: '',
   status: 'todo'
})

// User Info
const userInfo = ref({ role: 'Owner' })
const { data: authData } = await useFetch<any>('/api/auth/me')
if(authData.value?.success) userInfo.value = authData.value.user

// --- API Data Fetching ---
// Fetch Departments
const { data: deptData } = await useFetch<any>('/api/departments')
const departments = computed(() => deptData.value || [])

// Fetch Employees
const { data: empInfo } = await useFetch<any>('/api/members')
const employees = computed(() => {
   if (!empInfo.value) return []
   return empInfo.value.map((e: any) => ({
      id: e.id,
      name: e.name,
      avatar: e.avatar,
      departmentId: e.department_id,
      departmentName: getDepartmentName(e.department_id)
   }))
})

// --- Assignee Dropdown Input Logic ---
const assigneeDropdownRef = ref<HTMLElement | null>(null)
const assigneeSearchQuery = ref('')
const isAssigneeDropdownOpen = ref(false)
const assigneeDeptFilter = ref('all')

const filteredEmployees = computed(() => {
  let list = employees.value
  
  if (assigneeDeptFilter.value !== 'all') {
    list = list.filter(e => e.departmentId === assigneeDeptFilter.value)
  }
  
  if (assigneeSearchQuery.value) {
    const q = assigneeSearchQuery.value.toLowerCase()
    list = list.filter(e => e.name.toLowerCase().includes(q))
  }
  
  return list
})

const getDepartmentName = (id: string) => {
   const d = departments.value.find((dept: any) => dept.id === id)
   return d ? d.name : 'Unknown'
}

const selectAssignee = (emp: any) => {
  form.assigneeId = emp.id
  assigneeSearchQuery.value = emp.name
  isAssigneeDropdownOpen.value = false
}

const handleAssigneeSearchInput = () => {
  if (form.assigneeId) {
     const selected = employees.value.find(e => e.id === form.assigneeId)
     if (selected && selected.name !== assigneeSearchQuery.value) {
        form.assigneeId = undefined
     }
  }
}

// Click Outside
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

// Calculate Date Range for Fetch
const fetchRange = computed(() => {
   const start = new Date(currentYear.value, currentMonth.value, 1) // 1st of month
   const end = new Date(currentYear.value, currentMonth.value + 1, 0) // Last of month
   // Add buffer for padding days? The API filters strictly by due_date. 
   // We should fetch a bit more to cover the visible grid (prev month days / next month days)
   // But to keep simple, let's just fetch the whole month range + 7 days buffer both sides
   start.setDate(start.getDate() - 7)
   end.setDate(end.getDate() + 7)
   
   return {
      from: start.toISOString(),
      to: end.toISOString()
   }
})

// Fetch Tasks
const { data: tasksData, refresh: refreshTasks } = await useFetch<any>('/api/tasks', {
  query: computed(() => ({
    from: fetchRange.value.from,
    to: fetchRange.value.to,
    limit: 'all'
  }))
})

const tasks = computed(() => tasksData.value?.data || [])

// --- Calendar Logic ---
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  
  const daysInMonth = lastDayOfMonth.getDate()
  
  // 0 = Sunday, 1 = Monday. We want Monday start.
  // JS Day: 0(Sun), 1(Mon), ..., 6(Sat)
  // Adjusted: 1(Mon)... 6(Sat), 7(Sun)
  let startDay = firstDayOfMonth.getDay() 
  if (startDay === 0) startDay = 7
  
  const days: Date[] = []
  
  // Previous Month Padding
  for (let i = 1; i < startDay; i++) {
     days.push(new Date(year, month, 1 - (startDay - i)))
  }
  
  // Current Month
  for (let i = 1; i <= daysInMonth; i++) {
     days.push(new Date(year, month, i))
  }
  
  // Next Month Padding (fill up to 42 cells for consistent grid, or just enough to finish week)
  const remaining = 42 - days.length
  for (let i = 1; i <= remaining; i++) {
     days.push(new Date(year, month + 1, i))
  }
  
  return days
})

// --- Helpers ---
const isToday = (date: Date) => {
   const t = new Date()
   return date.getDate() === t.getDate() && 
          date.getMonth() === t.getMonth() && 
          date.getFullYear() === t.getFullYear()
}

const isCurrentMonth = (date: Date) => {
   return date.getMonth() === currentMonth.value
}

const formatDateDisplay = (date: Date) => {
   return date.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

const formatDateISO = (date: Date) => {
   // Adjust for timezone to ensure we get YYYY-MM-DD correctly
   const offset = date.getTimezoneOffset()
   const d = new Date(date.getTime() - (offset*60*1000))
   return d.toISOString().split('T')[0]
}

const getTasksForDate = (date: Date) => {
   // Filter tasks where due_date matches this date
   const dateStr = formatDateISO(date)
   return tasks.value.filter((t: any) => t.due_date === dateStr)
}

const getEmployee = (id: string) => employees.value.find(e => e.id === id)

// --- Interaction ---
const prevMonth = () => {
   if (currentMonth.value === 0) {
      currentMonth.value = 11
      currentYear.value--
   } else {
      currentMonth.value--
   }
}

const nextMonth = () => {
   if (currentMonth.value === 11) {
      currentMonth.value = 0
      currentYear.value++
   } else {
      currentMonth.value++
   }
}

const goToToday = () => {
   const t = new Date()
   currentMonth.value = t.getMonth()
   currentYear.value = t.getFullYear()
}

const handleDayClick = (date: Date) => {
   selectedDate.value = date
   // On Mobile: Open View Modal
   if (window.innerWidth < 640) { // SM breakpoint
      isMobileDayViewOpen.value = true
   } else {
      // Desktop: Do nothing or focus? 
      // The "+" button is available on hover. 
   }
}

// Modal Logic
const openCreateModal = (date: Date) => {
   isEditing.value = false
   editingId.value = null
   
   // Reset Form
   form.title = ''
   form.description = ''
   form.assigneeId = undefined 
   form.priority = 'medium'
   form.category = undefined
   form.status = 'todo'
   form.dueDate = formatDateISO(date)
   assigneeSearchQuery.value = ''
   form.assigneeId = undefined
   
   // Close mobile view if open
   isMobileDayViewOpen.value = false
   isModalOpen.value = true
}

const openEditModal = (task: any) => {
   isEditing.value = true
   editingId.value = task.id
   
   form.title = task.title
   form.description = task.description
   form.assigneeId = task.assignee_id || undefined
   form.priority = task.priority
   form.category = task.category
   form.status = task.status
   form.dueDate = task.due_date
   form.status = task.status
   const assignee = employees.value.find((e: any) => e.id === task.assignee_id)
   assigneeSearchQuery.value = assignee ? assignee.name : ''
   
   isMobileDayViewOpen.value = false
   isModalOpen.value = true
}

const submitTask = async () => {
   if (!form.title || !form.assigneeId || !form.dueDate) return
   isSubmitting.value = true
   
   try {
      const payload = {
         title: form.title,
         description: form.description,
         assignee_id: form.assigneeId || '',
         priority: form.priority,
         category: form.category,
         due_date: form.dueDate,
         status: isEditing.value ? form.status : 'todo'
      }
      
      const endpoint = isEditing.value ? `/api/tasks/${editingId.value}` : '/api/tasks'
      const method = isEditing.value ? 'PUT' : 'POST'
      
      await $fetch(endpoint, {
         method,
         body: payload
      })
      
      useToast().add({
         title: 'Thành công',
         description: isEditing.value ? 'Đã cập nhật nhiệm vụ' : 'Đã tạo nhiệm vụ mới',
         color: 'success'
      })
      
      isModalOpen.value = false
      refreshTasks()
   } catch (error: any) {
      useToast().add({
         title: 'Lỗi',
         description: error.message || 'Có lỗi xảy ra',
         color: 'error'
      })
   } finally {
      isSubmitting.value = false
   }
}

const selectedDateTasks = computed(() => {
   if (!selectedDate.value) return []
   return getTasksForDate(selectedDate.value)
})

</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #e5e7eb;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #374151;
}
</style>
