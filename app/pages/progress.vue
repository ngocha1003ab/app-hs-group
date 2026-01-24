<template>
  <div class="h-[calc(100vh-theme('spacing.32'))] flex flex-col">
    <!-- Page Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Tiến Độ Công Việc
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">
        Quản lý và theo dõi trạng thái các nhiệm vụ. Kéo thả thẻ nhiệm vụ giữa các cột để cập nhật tiến độ.
      </p>
    </div>

    <!-- Kanban Board -->
    <ClientOnly>
      <div class="flex-1 overflow-hidden">
         <!-- Desktop View (Horizontal Scroll) -->
         <div class="hidden lg:flex h-full gap-6 overflow-x-auto min-w-[1024px] pb-4">
           
           <!-- Column: Todo -->
           <div class="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800 h-full max-h-full min-w-[320px]">
             <div class="p-2 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-inherit rounded-t-xl z-10">
               <h3 class="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                 <div class="w-3 h-3 rounded-full bg-gray-400"></div>
                 Chưa làm
                 <span class="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-300">
                   {{ todoTasks.length }}
                 </span>
               </h3>
             </div>
             
             <div ref="todoParent" class="flex-1 p-2 sm:p-3 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 flex flex-col gap-3">
               <div 
                 v-for="task in todoTasks" 
                 :key="task.id"
                 @click="openTaskModal(task)"
                 class="bg-white dark:bg-gray-900 p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 cursor-pointer hover:shadow-md hover:border-primary-400 dark:hover:border-primary-500 transition-all group"
               >
                 <TaskCardContent :task="task" />
               </div>
             </div>
           </div>

           <!-- Column: In Progress -->
           <div class="flex-1 flex flex-col bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900 h-full max-h-full min-w-[320px]">
             <div class="p-2 sm:p-4 border-b border-blue-100 dark:border-blue-900 flex justify-between items-center sticky top-0 bg-inherit rounded-t-xl z-10">
               <h3 class="font-bold text-blue-700 dark:text-blue-200 flex items-center gap-2">
                 <div class="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                 Đang làm
                 <span class="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-xs rounded-full text-blue-600 dark:text-blue-300">
                   {{ inProgressTasks.length }}
                 </span>
               </h3>
             </div>
             
             <div ref="inProgressParent" class="flex-1 p-2 sm:p-3 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-800 flex flex-col gap-3">
               <div 
                 v-for="task in inProgressTasks" 
                 :key="task.id"
                 @click="openTaskModal(task)"
                 class="bg-white dark:bg-gray-900 p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 cursor-pointer hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all"
               >
                 <TaskCardContent :task="task" />
               </div>
             </div>
           </div>

           <!-- Column: Done -->
           <div class="flex-1 flex flex-col bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900 h-full max-h-full min-w-[320px]">
             <div class="p-2 sm:p-4 border-b border-green-100 dark:border-green-900 flex justify-between items-center sticky top-0 bg-inherit rounded-t-xl z-10">
               <h3 class="font-bold text-green-700 dark:text-green-200 flex items-center gap-2">
                 <div class="w-3 h-3 rounded-full bg-green-500"></div>
                 Đã hoàn thành
                 <span class="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-xs rounded-full text-green-600 dark:text-green-300">
                   {{ doneTasks.length }}
                 </span>
               </h3>
             </div>
             
             <div ref="doneParent" class="flex-1 p-2 sm:p-3 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-green-200 dark:scrollbar-thumb-green-800 flex flex-col gap-3">
               <div 
                 v-for="task in doneTasks" 
                 :key="task.id"
                 @click="openTaskModal(task)"
                 class="bg-white dark:bg-gray-900 p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 cursor-pointer hover:shadow-md hover:border-green-400 dark:hover:border-green-500 transition-all opacity-75 hover:opacity-100"
               >
                 <TaskCardContent :task="task" />
               </div>
             </div>
           </div>
         </div>

         <!-- Mobile View (Tabs + Single Column) -->
         <div class="lg:hidden h-full flex flex-col">
            <!-- Tabs -->
            <div class="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 shrink-0 overflow-x-auto no-scrollbar">
               <button 
                  v-for="tab in ['todo', 'in-progress', 'done']" 
                  :key="tab"
                  @click="activeMobileTab = tab"
                  class="flex-1 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all duration-200 flex flex-col items-center gap-1"
                  :class="activeMobileTab === tab ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
               >
                  <span>{{ getColumnTitle(tab) }}</span>
                  <span class="text-[10px] bg-gray-200 dark:bg-gray-600 px-1.5 rounded-full text-gray-600 dark:text-gray-300">
                     {{ getColumnLength(tab) }}
                  </span>
               </button>
            </div>

            <!-- Active Column Content -->
            <div class="flex-1 overflow-hidden relative bg-gray-50 dark:bg-gray-800/10 rounded-xl border border-gray-100 dark:border-gray-800">
               <!-- Todo Mobile -->
               <div v-if="activeMobileTab === 'todo'" class="absolute inset-0 flex flex-col">
                  <div ref="todoParentMobile" class="flex-1 p-3 overflow-y-auto min-h-0">
                     <div class="space-y-3 pb-safe">
                        <div v-for="task in todoTasks" :key="task.id" @click="openTaskModal(task)" class="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-transform">
                           <TaskCardContent :task="task" />
                        </div>
                        <div v-if="todoTasks.length === 0" class="text-center text-gray-400 py-8 text-sm italic">Không có công việc nào</div>
                     </div>
                  </div>
               </div>

               <!-- In Progress Mobile -->
               <div v-if="activeMobileTab === 'in-progress'" class="absolute inset-0 flex flex-col">
                  <div ref="inProgressParentMobile" class="flex-1 p-3 overflow-y-auto min-h-0">
                     <div class="space-y-3 pb-safe">
                        <div v-for="task in inProgressTasks" :key="task.id" @click="openTaskModal(task)" class="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30 active:scale-[0.98] transition-transform">
                           <TaskCardContent :task="task" />
                        </div>
                         <div v-if="inProgressTasks.length === 0" class="text-center text-gray-400 py-8 text-sm italic">Không có công việc nào</div>
                     </div>
                  </div>
               </div>

               <!-- Done Mobile -->
               <div v-if="activeMobileTab === 'done'" class="absolute inset-0 flex flex-col">
                  <div ref="doneParentMobile" class="flex-1 p-3 overflow-y-auto min-h-0">
                     <div class="space-y-3 pb-safe">
                        <div v-for="task in doneTasks" :key="task.id" @click="openTaskModal(task)" class="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm border border-green-100 dark:border-green-900/30 opacity-75 active:scale-[0.98] transition-all">
                           <TaskCardContent :task="task" />
                        </div>
                         <div v-if="doneTasks.length === 0" class="text-center text-gray-400 py-8 text-sm italic">Không có công việc nào</div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </ClientOnly>

    <!-- Loading / Pagination Removed (Infinite Scroll Active) -->

    <!-- Custom Task Detail Modal (HTML/CSS) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isModalOpen" class="fixed inset-0 z-99999 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="isModalOpen = false"></div>

        <div class="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center">
          <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div class="relative transform overflow-hidden bg-white dark:bg-gray-900 text-left shadow-xl transition-all w-full h-[100dvh] sm:h-auto sm:my-8 sm:max-w-2xl sm:rounded-lg border-0 sm:border border-gray-200 dark:border-gray-800 flex flex-col">
              <div v-if="selectedTask" class="flex flex-col h-full sm:max-h-[85vh]">
                <!-- Header -->
                <div class="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-white dark:bg-gray-900 sticky top-0 z-10">
                  <div class="space-y-1">
                    <div class="flex items-center gap-3 mb-2">
                      <UBadge :color="getPriorityColor(selectedTask.priority)" variant="subtle" size="xs">
                        {{ getPriorityLabel(selectedTask.priority) }}
                      </UBadge>
                      <UBadge color="neutral" variant="soft" size="xs">
                        {{ selectedTask.department }}
                      </UBadge>
                    </div>
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                      {{ selectedTask.title }}
                    </h2>
                  </div>
                  <button @click="isModalOpen = false" class="text-gray-400 hover:text-gray-500 focus:outline-none">
                    <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
                  </button>
                </div>

                <!-- Scrollable Content -->
                <div class="p-4 sm:p-6 overflow-y-auto flex-1 space-y-8 bg-white dark:bg-gray-900">
                  
                  <!-- Status (Mobile Support) -->
                  <div>
                      <label class="block text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Trạng thái</label>
                      <div class="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <button
                          v-for="status in [
                            { label: 'Cần làm', value: 'todo', activeColor: 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' },
                            { label: 'Đang làm', value: 'in-progress', activeColor: 'bg-blue-500 text-white shadow-md' },
                            { label: 'Hoàn thành', value: 'done', activeColor: 'bg-green-500 text-white shadow-md' }
                          ]"
                          :key="status.value"
                          type="button"
                          @click="changeTaskStatus(status.value)"
                          class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                          :class="selectedTask.status === status.value ? status.activeColor : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'"
                        >
                          {{ status.label }}
                        </button>
                      </div>
                  </div>

                  <!-- Description -->
                  <div class="space-y-3">
                     <h4 class="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Mô tả nhiệm vụ</h4>
                     <p class="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                       {{ selectedTask.description }}
                     </p>
                  </div>

                  <!-- Assignee Info -->
                  <div class="space-y-3">
                     <h4 class="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Người thực hiện</h4>
                     <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg w-fit pr-6 border border-gray-100 dark:border-gray-800">
                        <UAvatar :src="selectedTask.assignee.avatar" :alt="selectedTask.assignee.name" size="md" />
                        <div>
                           <div class="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-sm">
                              {{ selectedTask.assignee.name }}
                              <UIcon v-if="selectedTask.assignee.isLeader" name="i-heroicons-star" class="w-4 h-4 text-yellow-500" title="Leader" />
                           </div>
                           <div class="text-xs text-gray-500">Thành viên Ban {{ selectedTask.department }}</div>
                        </div>
                     </div>
                  </div>

                  <!-- Comments Section -->
                  <div class="space-y-4">
                    <h4 class="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                      <UIcon name="i-heroicons-chat-bubble-left-right" class="w-4 h-4" />
                      Bình luận ({{ selectedTask.comments.length }})
                    </h4>
                    
                    <!-- Comment List -->
                    <div class="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                       <div v-for="comment in selectedTask.comments" :key="comment.id" class="flex gap-3 group">
                          <UAvatar :src="comment.userAvatar" :alt="comment.userName" size="xs" class="mt-1 flex-shrink-0" />
                          <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex-1 text-sm border border-gray-100 dark:border-gray-700">
                             <div class="flex justify-between items-baseline mb-1">
                                <span class="font-semibold text-gray-900 dark:text-white">{{ comment.userName }}</span>
                                <span class="text-xs text-gray-400">{{ formatDate(comment.createdAt) }}</span>
                             </div>
                             <p class="text-gray-600 dark:text-gray-300">{{ comment.content }}</p>
                          </div>
                       </div>
                       <div v-if="selectedTask.comments.length === 0" class="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-dashed border-gray-200 dark:border-gray-700">
                         <p class="text-gray-400 italic text-sm">Chưa có bình luận nào.</p>
                       </div>
                    </div>

                    <!-- Add Comment Input -->
                    <div class="flex gap-3 items-start pt-4 border-t border-gray-100 dark:border-gray-800">
                       <UAvatar :src="userAvatar" :alt="userName" size="sm" class="mt-0.5" />
                       <div class="flex-1 space-y-2">
                         <UTextarea 
                            v-model="newComment" 
                            placeholder="Viết bình luận..." 
                            :rows="2" 
                            autoresize
                            size="sm"
                            class="w-full"
                         />
                         <div class="flex justify-end">
                            <UButton 
                              size="sm" 
                              color="primary" 
                              :disabled="!newComment.trim()"
                              @click="addComment"
                              icon="i-heroicons-paper-airplane"
                            >
                              Gửi bình luận
                            </UButton>
                         </div>
                       </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, defineComponent, h } from 'vue'
import { useDragAndDrop } from '@formkit/drag-and-drop/vue'
import { useInfiniteScroll } from '@vueuse/core'

definePageMeta({
  layout: 'app'
})

useHead({
  title: 'Tiến độ công việc - SheetVN'
})

// --- Types ---
// --- Types ---
type Priority = 'low' | 'medium' | 'high'

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string
  content: string
  createdAt: string
}

interface Task {
  id: string
  title: string
  description: string
  priority: Priority
  department: string
  dueDate: string // ISO date string
  assignee: {
    name: string
    avatar: string
    isLeader: boolean
  }
  status: 'todo' | 'in-progress' | 'done'
  comments: Comment[]
}

// --- State ---
const isModalOpen = ref(false)
const selectedTask = ref<Task | null>(null)
const newComment = ref('')

// Mobile Tab State
const activeMobileTab = ref('todo')

const getColumnTitle = (tab: string) => {
   switch(tab) {
      case 'todo': return 'Chưa làm'
      case 'in-progress': return 'Đang làm'
      case 'done': return 'Đã hoàn thành'
      default: return ''
   }
}

const getColumnLength = (tab: string) => {
   switch(tab) {
      case 'todo': return todoTasks.value.length
      case 'in-progress': return inProgressTasks.value.length
      case 'done': return doneTasks.value.length
      default: return 0
   }
}

// --- User Info for Commenting ---
const userId = ref<string>('') // To check self
const userAvatar = ref('')
const userName = ref('')

// Fetch User
const { data: authData } = await useFetch<any>('/api/auth/me')
if (authData.value && authData.value.success) {
   userId.value = authData.value.user.role === 'Owner' ? 'owner' : authData.value.user.id // This might need adjustment if 'id' is mapped
   // Actually auth/me returns the user object we constructed.
   // Let's rely on userInfo from auth/me
   userName.value = authData.value.user.name
   userAvatar.value = authData.value.user.avatar
}

// --- Data Fetching ---
// Need departments to map names? API tasks might return IDs.
// Let's assume we can get dept names or tasks API includes them?
// The tasks API returns department_id. We fetch depts mapping.
const { data: deptData } = await useFetch<any[]>('/api/departments')
const departments = computed(() => deptData.value || [])

const { data: empData } = await useFetch<any[]>('/api/members')
const employees = computed(() => empData.value || [])

const getDeptName = (id: string) => {
   const d = departments.value.find(x => x.id === id)
   return d ? d.name : 'Unknown'
}

const getMember = (id: string) => {
   return employees.value.find(x => x.id === id)
}

// --- Infinite Scroll & Data Management ---

// Helper Composable for Column Data
const useColumnTasks = (status: Task['status']) => {
    const page = ref(1)
    const limit = 20
    const hasMore = ref(true)
    const tasks = ref<Task[]>([])
    const isLoading = ref(false)
    const total = ref(0)
    
    // Capture headers for SSR
    const headers = useRequestHeaders(['cookie'])

    const fetchTasks = async () => {
        if (!hasMore.value && page.value !== 1) return
        
        isLoading.value = true
        try {
            const res = await $fetch<any>('/api/tasks', {
                params: {
                    page: page.value,
                    limit,
                    status
                },
                headers: import.meta.server ? headers : undefined
            })
            
            const newTasks = res.data.map((t: any) => {
                const assignee = getMember(t.assignee_id)
                return {
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    priority: t.priority,
                    department: getDeptName(t.department_id),
                    dueDate: t.due_date,
                    status: t.status,
                    assignee: {
                        name: assignee ? assignee.name : 'Unknown',
                        avatar: assignee ? assignee.avatar : '',
                        isLeader: assignee ? assignee.role === 'Leader' : false
                    },
                    comments: []
                }
            })

            if (page.value === 1) {
                tasks.value = newTasks
            } else {
                tasks.value = [...tasks.value, ...newTasks]
            }

            total.value = res.total
            hasMore.value = tasks.value.length < res.total
            page.value++
        } catch (error) {
            console.error(`Error fetching ${status} tasks:`, error)
        } finally {
            isLoading.value = false
        }
    }
    
    return { tasks, fetchTasks, hasMore, isLoading, total }
}

const todoState = useColumnTasks('todo')
const inProgressState = useColumnTasks('in-progress')
const doneState = useColumnTasks('done')

// Initial Load
await Promise.all([
    todoState.fetchTasks(),
    inProgressState.fetchTasks(),
    doneState.fetchTasks()
])


// --- Drag & Drop Columns ---
const [todoParent, todoTasks] = useDragAndDrop<Task>(todoState.tasks.value, { group: 'tasks', sortable: true })
const [inProgressParent, inProgressTasks] = useDragAndDrop<Task>(inProgressState.tasks.value, { group: 'tasks', sortable: true })
const [doneParent, doneTasks] = useDragAndDrop<Task>(doneState.tasks.value, { group: 'tasks', sortable: true })

// Sync state tasks to drag and drop refs when fetched
watch(todoState.tasks, (newVal) => { 
    // If we just replace the value, it might reset the scroll or state.
    // Ideally we want to maintain the list reference or careful update.
    // For infinite scroll append, newVal has all items.
    todoTasks.value = newVal 
})
watch(inProgressState.tasks, (newVal) => { inProgressTasks.value = newVal })
watch(doneState.tasks, (newVal) => { doneTasks.value = newVal })

// Infinite Scroll Bindings
// Use the SAME parent refs from useDragAndDrop for infinite scroll
useInfiniteScroll(todoParent, () => { todoState.fetchTasks() }, { distance: 10 })
useInfiniteScroll(inProgressParent, () => { inProgressState.fetchTasks() }, { distance: 10 })
useInfiniteScroll(doneParent, () => { doneState.fetchTasks() }, { distance: 10 })

// --- Drag & Drop Persistence ---
const handleStatusChange = async (task: Task, newStatus: Task['status']) => {
    if (task.status === newStatus) return
    
    const oldStatus = task.status
    task.status = newStatus // Optimistic update
    
    try {
       await $fetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          body: { status: newStatus }
       })
       toast.add({ title: 'Cập nhật', description: 'Đã cập nhật trạng thái', color: 'success' })
    } catch (e: any) {
       task.status = oldStatus // Revert
       // If we revert, we might need to move it back visually? 
       // Complex with independent lists. For now just toast error.
       toast.add({ title: 'Lỗi', description: e.data?.message || 'Không thể cập nhật trạng thái', color: 'error' })
       // Force refresh column to fix visual state?
       // todoState.fetchTasks() // This appends... not refresh.
       // Reloading page might be needed or smarter rollback.
    }
}

watch(todoTasks, (list) => {
  list.forEach(t => { if(t.status !== 'todo') handleStatusChange(t, 'todo') })
}, { deep: true })

watch(inProgressTasks, (list) => {
  list.forEach(t => { if(t.status !== 'in-progress') handleStatusChange(t, 'in-progress') })
}, { deep: true })

watch(doneTasks, (list) => {
  list.forEach(t => { if(t.status !== 'done') handleStatusChange(t, 'done') })
}, { deep: true })


// --- Methods ---
const getPriorityLabel = (p: Priority) => {
  switch(p) {
    case 'high': return 'Cao'
    case 'medium': return 'Trung bình'
    case 'low': return 'Thấp'
  }
}

const getPriorityColor = (p: Priority) => {
  switch(p) {
    case 'high': return 'error'
    case 'medium': return 'warning'
    case 'low': return 'neutral' 
  }
}

const formatDate = (dateString: string) => {
   if(!dateString) return ''
  return new Date(dateString).toLocaleString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const openTaskModal = async (task: Task) => {
  selectedTask.value = task
  isModalOpen.value = true
  
  // Fetch Comments
  const createdComments = await $fetch<Comment[]>(`/api/comments?taskId=${task.id}`)
  if(selectedTask.value) {
      selectedTask.value.comments = createdComments
  }
}

const toast = useToast()

const changeTaskStatus = async (newStatus: string) => { // Using string to match simple logic, cast internally
    if (!selectedTask.value || selectedTask.value.status === newStatus) return
    
    // cast status
    const status = newStatus as Task['status']
    const task = selectedTask.value
    const oldStatus = task.status
    
    // 1. Update UI List (Move task)
    // Remove from old
    if (oldStatus === 'todo') todoTasks.value = todoTasks.value.filter(t => t.id !== task.id)
    else if (oldStatus === 'in-progress') inProgressTasks.value = inProgressTasks.value.filter(t => t.id !== task.id)
    else if (oldStatus === 'done') doneTasks.value = doneTasks.value.filter(t => t.id !== task.id)

    // Update property
    task.status = status
    
    // Add to new (prepend)
    if (status === 'todo') todoTasks.value = [task, ...todoTasks.value]
    else if (status === 'in-progress') inProgressTasks.value = [task, ...inProgressTasks.value]
    else if (status === 'done') doneTasks.value = [task, ...doneTasks.value]

    // 2. API Update
    try {
        await $fetch(`/api/tasks/${task.id}`, {
            method: 'PUT',
            body: { status: status }
        })
        toast.add({ title: 'Cập nhật', description: 'Đã cập nhật trạng thái', color: 'success' })
    } catch (e: any) {
        toast.add({ title: 'Lỗi', description: 'Không thể cập nhật trạng thái', color: 'error' })
        // Could revert here if strict
    }
}

const addComment = async () => {
    if (!selectedTask.value || !newComment.value.trim()) return

    try {
        const res = await $fetch<any>('/api/comments', {
            method: 'POST',
            body: {
                taskId: selectedTask.value.id,
                content: newComment.value
            }
        })
        
        if(res.success) {
            // Optimistic update or refresh
            // Let's refresh view
            const newCmt = res.data
             // Enrich with current user info immediately for UI
            const enrichedCmt = {
                 id: newCmt.id,
                 userId: newCmt.user_id,
                 userName: userName.value || 'Me', 
                 userAvatar: userAvatar.value,
                 content: newCmt.content,
                 createdAt: newCmt.created_at
            }
            
            selectedTask.value.comments.push(enrichedCmt)
            newComment.value = ''
            toast.add({ title: 'Thành công', description: 'Đã gửi bình luận', color: 'success' })
        }
    } catch (e: any) {
        toast.add({ title: 'Lỗi', description: e.data?.message || 'Không thể gửi bình luận', color: 'error' })
    }
}
const TaskCardContent = defineComponent({
  props: ['task'],
  setup(props) {
    const priorityColor = computed(() => {
        switch(props.task.priority) {
            case 'high': return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-400/10 border-red-100 dark:border-red-900'
            case 'medium': return 'text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-400/10 border-orange-100 dark:border-orange-900'
            case 'low': return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-400/10 border-gray-100 dark:border-gray-800'
        }
    })
    
    const priorityLabel = computed(() => {
        switch(props.task.priority) {
            case 'high': return 'Cao'
            case 'medium': return 'Trung bình'
            case 'low': return 'Thấp'
        }
    })

    const isOverdue = computed(() => {
        if (props.task.status === 'done') return false
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return new Date(props.task.dueDate) < today
    })
    
    const formattedDueDate = computed(() => {
        if (!props.task.dueDate) return ''
        const date = new Date(props.task.dueDate)
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
    })

    return () => h('div', { class: 'space-y-3 pointer-events-none' }, [
      // Badges Row
      h('div', { class: 'flex items-center justify-between' }, [
        h('span', { class: `text-[10px] font-bold px-2 py-0.5 rounded border ${priorityColor.value}` }, priorityLabel.value),
        h('span', { class: 'text-[10px] font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded' }, props.task.department)
      ]),
      
      // Title & Desc
      h('div', {}, [
        h('h4', { class: 'font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug' }, props.task.title),
        h('p', { class: 'text-xs text-gray-500 mt-1 line-clamp-2' }, props.task.description)
      ]),

      // Due Date (New)
      h('div', { class: 'flex items-center gap-1.5 text-xs' }, [
         h('span', { class: `i-heroicons-calendar w-3.5 h-3.5 ${isOverdue.value ? 'text-red-500' : 'text-gray-400'}` }),
         h('span', { class: isOverdue.value ? 'text-red-600 font-medium' : 'text-gray-500' }, 
           [
              formattedDueDate.value, 
              isOverdue.value ? ' (Quá hạn)' : ''
           ]
         )
      ]),
      
      // Footer: Assignee & Comments count
      h('div', { class: 'flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800' }, [
         h('div', { class: 'flex items-center gap-2' }, [
            h('img', { src: props.task.assignee.avatar || 'https://ui-avatars.com/api/?background=random', class: 'w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-900' }),
            props.task.assignee.isLeader ? h('span', { class: 'i-heroicons-star w-3 h-3 text-yellow-500', title: 'Leader' }) : null
         ]),
         // Only show if comments exist (optional optimization could be length from API task if included)
      ])
    ])
  }
})
</script>

<style scoped>
/* Custom scrollbar for column content if needed */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
