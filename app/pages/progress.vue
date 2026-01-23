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
      <div class="flex-1 overflow-x-auto overflow-y-hidden">
        <div class="h-full flex gap-6 min-w-[1024px]">
          
          <!-- Column: Todo -->
          <div class="flex-1 flex flex-col bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800 h-full max-h-full">
            <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-inherit rounded-t-xl z-10">
              <h3 class="font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-gray-400"></div>
                Chưa làm
                <span class="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-300">
                  {{ todoTasks.length }}
                </span>
              </h3>
            </div>
            
            <div ref="todoParent" class="flex-1 p-3 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 flex flex-col gap-3">
              <div 
                v-for="task in todoTasks" 
                :key="task.id"
                @click="openTaskModal(task)"
                class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 cursor-pointer hover:shadow-md hover:border-primary-400 dark:hover:border-primary-500 transition-all group"
              >
                <TaskCardContent :task="task" />
              </div>
            </div>
          </div>

          <!-- Column: In Progress -->
          <div class="flex-1 flex flex-col bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900 h-full max-h-full">
            <div class="p-4 border-b border-blue-100 dark:border-blue-900 flex justify-between items-center sticky top-0 bg-inherit rounded-t-xl z-10">
              <h3 class="font-bold text-blue-700 dark:text-blue-200 flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                Đang làm
                <span class="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-xs rounded-full text-blue-600 dark:text-blue-300">
                  {{ inProgressTasks.length }}
                </span>
              </h3>
            </div>
            
            <div ref="inProgressParent" class="flex-1 p-3 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-blue-200 dark:scrollbar-thumb-blue-800 flex flex-col gap-3">
              <div 
                v-for="task in inProgressTasks" 
                :key="task.id"
                @click="openTaskModal(task)"
                class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 cursor-pointer hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all"
              >
                <TaskCardContent :task="task" />
              </div>
            </div>
          </div>

          <!-- Column: Done -->
          <div class="flex-1 flex flex-col bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900 h-full max-h-full">
            <div class="p-4 border-b border-green-100 dark:border-green-900 flex justify-between items-center sticky top-0 bg-inherit rounded-t-xl z-10">
              <h3 class="font-bold text-green-700 dark:text-green-200 flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                Đã hoàn thành
                <span class="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-xs rounded-full text-green-600 dark:text-green-300">
                  {{ doneTasks.length }}
                </span>
              </h3>
            </div>
            
            <div ref="doneParent" class="flex-1 p-3 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-green-200 dark:scrollbar-thumb-green-800 flex flex-col gap-3">
              <div 
                v-for="task in doneTasks" 
                :key="task.id"
                @click="openTaskModal(task)"
                class="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 cursor-pointer hover:shadow-md hover:border-green-400 dark:hover:border-green-500 transition-all opacity-75 hover:opacity-100"
              >
                <TaskCardContent :task="task" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </ClientOnly>

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

        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <Transition
            enter-active-class="transition ease-out duration-300"
            enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to-class="opacity-100 translate-y-0 sm:scale-100"
            leave-active-class="transition ease-in duration-200"
            leave-from-class="opacity-100 translate-y-0 sm:scale-100"
            leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div class="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-200 dark:border-gray-800">
              <div v-if="selectedTask" class="flex flex-col max-h-[85vh]">
                <!-- Header -->
                <div class="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-start bg-white dark:bg-gray-900 sticky top-0 z-10">
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
                <div class="p-6 overflow-y-auto flex-1 space-y-8 bg-white dark:bg-gray-900">
                  
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
                       <UAvatar src="https://avatars.githubusercontent.com/u/739984?v=4" alt="Me" size="sm" class="mt-0.5" />
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

definePageMeta({
  layout: 'app'
})

useHead({
  title: 'Tiến độ công việc - SheetVN'
})

// --- Types ---
type Priority = 'low' | 'medium' | 'high'

interface Comment {
  id: number
  userId: number
  userName: string
  userAvatar: string
  content: string
  createdAt: string
}

interface Task {
  id: number
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

// Initial Mock Data
const initialMockTasks: Task[] = [
  {
    id: 1,
    title: 'Phân tích yêu cầu dự án Mobile App',
    description: 'Thống nhất các yêu cầu chức năng với khách hàng và viết tài liệu SRS.',
    priority: 'high',
    department: 'Kỹ Thuật & IT',
    dueDate: '2023-11-15',
    assignee: { name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?u=1', isLeader: true },
    status: 'todo',
    comments: []
  },
  {
    id: 2,
    title: 'Thiết kế Logo mới',
    description: 'Tạo 3 option logo cho chiến dịch mùa hè.',
    priority: 'medium',
    department: 'Marketing',
    dueDate: '2023-10-30', // Overdue mock
    assignee: { name: 'Ngô Văn G', avatar: 'https://i.pravatar.cc/150?u=7', isLeader: true },
    status: 'todo',
    comments: [
        { id: 101, userId: 2, userName: 'Bùi Thị H', userAvatar: 'https://i.pravatar.cc/150?u=8', content: 'Cần file vector hay chỉ cần png trước?', createdAt: '2023-10-26T09:00:00' }
    ]
  },
  {
    id: 3,
    title: 'Cập nhật giao diện trang chủ',
    description: 'Bổ sung banner mới và slider sản phẩm bán chạy.',
    priority: 'medium',
    department: 'Kỹ Thuật & IT',
    dueDate: '2023-12-01',
    assignee: { name: 'Vũ Thị K', avatar: 'https://i.pravatar.cc/150?u=10', isLeader: false },
    status: 'in-progress',
    comments: []
  },
  {
    id: 4,
    title: 'Tuyển dụng nhân viên SEO',
    description: 'Đăng tin tuyển dụng trên LinkedIn và TopCV, lọc hồ sơ vòng 1.',
    priority: 'high',
    department: 'Nhân Sự (HR)',
    dueDate: '2023-11-20',
    assignee: { name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?u=4', isLeader: false },
    status: 'in-progress',
    comments: []
  },
  {
    id: 5,
    title: 'Báo cáo doanh thu Quý 1',
    description: 'Tổng hợp số liệu từ các phòng ban và làm slide báo cáo.',
    priority: 'low',
    department: 'Phòng Kinh Doanh',
    dueDate: '2023-10-25',
    assignee: { name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?u=2', isLeader: false },
    status: 'done',
    comments: [
        { id: 201, userId: 1, userName: 'Nguyễn Văn A', userAvatar: 'https://i.pravatar.cc/150?u=1', content: 'Số liệu rất chi tiết, cảm ơn em.', createdAt: '2023-10-25T14:30:00' }
    ]
  }
]

// Initialize Drag and Drop Columns
const [todoParent, todoTasks] = useDragAndDrop(
  initialMockTasks.filter(t => t.status === 'todo'), 
  { group: 'tasks', sortable: true }
)

const [inProgressParent, inProgressTasks] = useDragAndDrop(
  initialMockTasks.filter(t => t.status === 'in-progress'),
  { group: 'tasks', sortable: true }
)

const [doneParent, doneTasks] = useDragAndDrop(
    initialMockTasks.filter(t => t.status === 'done'),
    { group: 'tasks', sortable: true }
)


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
  return new Date(dateString).toLocaleString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const openTaskModal = (task: Task) => {
  selectedTask.value = task
  isModalOpen.value = true
}

const addComment = () => {
    if (!selectedTask.value || !newComment.value.trim()) return

    selectedTask.value.comments.push({
        id: Date.now(),
        userId: 999,
        userName: 'Admin User',
        userAvatar: 'https://avatars.githubusercontent.com/u/739984?v=4', // Mock current user
        content: newComment.value,
        createdAt: new Date().toISOString()
    })
    
    newComment.value = ''
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
            h('img', { src: props.task.assignee.avatar, class: 'w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-900' }),
            props.task.assignee.isLeader ? h('span', { class: 'i-heroicons-star w-3 h-3 text-yellow-500', title: 'Leader' }) : null
         ]),
         props.task.comments.length > 0 ? h('div', { class: 'flex items-center gap-1 text-xs text-gray-400' }, [
             h('span', { class: 'i-heroicons-chat-bubble-left w-3 h-3' }),
             h('span', {}, props.task.comments.length)
         ]) : null
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
