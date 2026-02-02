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
    <!-- 1. Create Task Section (Hidden for Members) -->
    <div v-if="userInfo.role !== 'Member'" class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
      <div class="p-3 sm:p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <UIcon name="i-heroicons-plus-circle" class="w-5 h-5 text-primary-500" />
          Tạo nhiệm vụ mới
        </h3>
      </div>
      
      <form @submit.prevent="createTask" class="p-3 sm:p-6 space-y-6">
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
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
               <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Độ ưu tiên</label>
                  <div class="flex gap-2">
                    <button 
                      type="button" 
                      v-for="p in priorities" 
                      :key="p.value"
                      @click="newTask.priority = p.value as any"
                      class="flex-1 flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-lg border-2 transition-all"
                      :class="newTask.priority === p.value ? p.activeClass : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-500 hover:border-gray-200'"
                    >
                       <span class="text-xs font-bold">{{ p.label }}</span>
                    </button>
                  </div>
               </div>
               
               <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Hạn hoàn thành</label>
                  <UInput v-model="newTask.dueDate" type="date" size="lg" icon="i-heroicons-calendar" class="w-full" />
               </div>
            </div>

            <!-- Category Selector (Searchable Dropdown) -->
            <div class="space-y-2 relative" ref="categoryDropdownRef">
               <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Danh mục công việc</label>
               
               <UInput 
                 v-model="categorySearchQuery"
                 placeholder="Chọn danh mục..."
                 size="lg"
                 icon="i-heroicons-tag"
                 class="w-full cursor-pointer"
                 @focus="isCategoryDropdownOpen = true"
                 @input="handleCategorySearchInput"
                 autocomplete="off"
                 readonly
               >
                  <template #trailing>
                     <div class="flex items-center gap-1">
                        <UIcon v-if="newTask.category" name="i-heroicons-check-circle" class="w-5 h-5 text-green-500" />
                        <UIcon name="i-heroicons-chevron-down" class="w-4 h-4 text-gray-400" />
                     </div>
                  </template>
               </UInput>

               <!-- Category Dropdown -->
               <div 
                 v-if="isCategoryDropdownOpen"
                 class="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
               >
                  <!-- Search Input -->
                  <div class="p-2 border-b border-gray-100 dark:border-gray-800">
                     <UInput 
                       v-model="categoryFilterQuery" 
                       placeholder="Tìm danh mục..." 
                       size="sm" 
                       icon="i-heroicons-magnifying-glass"
                       class="w-full"
                     />
                  </div>
                  
                  <!-- Category List -->
                  <div class="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                     <div 
                       v-for="cat in filteredCategories" 
                       :key="cat.id"
                       @click="selectCategory(cat)"
                       class="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                       :class="{'bg-primary-50 dark:bg-primary-900/20': newTask.category === cat.id}"
                     >
                        <div 
                          class="w-8 h-8 rounded-lg flex items-center justify-center"
                          :style="{ backgroundColor: cat.color + '20' }"
                        >
                          <UIcon :name="cat.icon" class="w-4 h-4" :style="{ color: cat.color }" />
                        </div>
                        <span class="flex-1 text-sm font-medium text-gray-900 dark:text-white">{{ cat.name }}</span>
                        <UIcon v-if="newTask.category === cat.id" name="i-heroicons-check" class="w-5 h-5 text-primary-500" />
                     </div>
                     <div v-if="filteredCategories.length === 0" class="p-4 text-center text-gray-500 text-sm italic">
                       Không tìm thấy danh mục phù hợp.
                     </div>
                  </div>
                  
                  <!-- Clear Selection -->
                  <div v-if="newTask.category" class="p-2 border-t border-gray-100 dark:border-gray-800">
                     <button 
                       type="button"
                       @click="clearCategory"
                       class="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                     >
                       Bỏ chọn danh mục
                     </button>
                  </div>
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
      <div class="p-3 sm:p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Danh sách Nhiệm vụ ({{ tasks.length }})</h3>
        <UInput v-model="taskListSearch" icon="i-heroicons-magnifying-glass" placeholder="Tìm tên nhiệm vụ..." size="sm" color="neutral" />
      </div>

      <!-- Desktop Table View -->
      <div class="hidden sm:block overflow-x-auto">
        <table class="w-full text-sm text-left">
           <!-- ... (table content) ... -->
          <thead class="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th class="px-3 py-3 sm:px-6 font-medium">Nhiệm vụ</th>
              <th class="px-3 py-3 sm:px-6 font-medium">Danh mục</th>
              <th class="px-3 py-3 sm:px-6 font-medium">Người thực hiện</th>
              <th class="px-3 py-3 sm:px-6 font-medium">Hạn chót</th>
              <th class="px-3 py-3 sm:px-6 font-medium">Trạng thái</th>
              <th class="px-3 py-3 sm:px-6 font-medium">Ưu tiên</th>
              <th class="px-3 py-3 sm:px-6 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="task in filteredTasks" :key="task.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
              <td class="px-3 py-3 sm:px-6 sm:py-4">
                 <div class="font-semibold text-gray-900 dark:text-white">{{ task.title }}</div>
                 <div class="text-xs text-gray-500 line-clamp-1 mt-0.5">{{ task.description }}</div>
              </td>
              <td class="px-3 py-3 sm:px-6 sm:py-4">
                 <div v-if="task.category" class="flex items-center gap-1.5">
                    <UIcon :name="getCategoryIcon(task.category)" class="w-4 h-4 text-primary-500" />
                    <span class="text-xs text-gray-600 dark:text-gray-400">{{ getCategoryLabel(task.category) }}</span>
                 </div>
                 <span v-else class="text-xs text-gray-400 italic">-</span>
              </td>
              <td class="px-3 py-3 sm:px-6 sm:py-4">
                 <div class="flex items-center gap-2">
                    <UAvatar :src="getEmployee(task.assigneeId)?.avatar" size="2xs" />
                    <span class="text-gray-700 dark:text-gray-300">{{ getEmployee(task.assigneeId)?.name }}</span>
                 </div>
              </td>
              <td class="px-3 py-3 sm:px-6 sm:py-4">
                 <span :class="isOverdue(task.dueDate) ? 'text-red-500 font-medium' : 'text-gray-600'">
                    {{ formatDate(task.dueDate) }}
                 </span>
                 <div v-if="isOverdue(task.dueDate)" class="text-[10px] text-red-500 font-bold uppercase">Quá hạn</div>
              </td>
              <td class="px-3 py-3 sm:px-6 sm:py-4">
                 <UBadge :color="task.status === 'done' ? 'success' : (task.status === 'in-progress' ? 'info' : 'neutral')" variant="subtle" size="xs">
                    {{ task.status === 'done' ? 'Hoàn thành' : (task.status === 'in-progress' ? 'Đang làm' : 'Cần làm') }}
                 </UBadge>
              </td>
               <td class="px-3 py-3 sm:px-6 sm:py-4">
                 <UBadge :color="priorityBadge(task.priority).color" variant="subtle" size="xs">
                    {{ priorityBadge(task.priority).label }}
                 </UBadge>
              </td>
              <td class="px-3 py-3 sm:px-6 sm:py-4 text-right">
                 <UButton icon="i-heroicons-pencil-square" size="sm" color="neutral" variant="ghost" @click="openEditModal(task)" />
              </td>
            </tr>
            <tr v-if="filteredTasks.length === 0">
              <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                <span v-if="fetchStatus === 'pending'">Đang tải...</span>
                <span v-else>Không tìm thấy nhiệm vụ nào.</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile List View -->
      <div class="sm:hidden space-y-3 p-3 pt-0">
         <div v-if="filteredTasks.length === 0" class="p-8 text-center text-gray-500">
             <span v-if="fetchStatus === 'pending'">Đang tải...</span>
             <span v-else>Không tìm thấy nhiệm vụ nào.</span>
         </div>
         
         <div 
            v-for="task in filteredTasks" 
            :key="'mobile-task-' + task.id"
            class="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-3"
         >
            <!-- Header: Status + Priority + Title -->
            <div>
               <div class="flex justify-between items-start mb-2">
                  <UBadge :color="task.status === 'done' ? 'success' : (task.status === 'in-progress' ? 'info' : 'neutral')" variant="subtle" size="xs">
                     {{ task.status === 'done' ? 'Hoàn thành' : (task.status === 'in-progress' ? 'Đang làm' : 'Cần làm') }}
                  </UBadge>
                  <UButton icon="i-heroicons-pencil-square" size="xs" color="neutral" variant="ghost" @click="openEditModal(task)" />
               </div>
               <h4 class="font-bold text-gray-900 dark:text-white leading-tight">{{ task.title }}</h4>
               <p class="text-xs text-gray-500 mt-1 line-clamp-2" v-if="task.description">{{ task.description }}</p>
            </div>

            <!-- Divider -->
            <div class="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>

            <!-- Meta Grid -->
            <div class="grid grid-cols-2 gap-4">
               <!-- Left: Assignee -->
               <div class="flex items-center gap-2">
                  <UAvatar :src="getEmployee(task.assigneeId)?.avatar" size="2xs" />
                  <div class="overflow-hidden">
                     <div class="text-[10px] text-gray-500 uppercase tracking-wider">Người làm</div>
                     <div class="text-xs font-medium truncate">{{ getEmployee(task.assigneeId)?.name || 'Unknown' }}</div>
                  </div>
               </div>
               
               <!-- Right: Due Date -->
               <div class="flex items-center gap-2">
                   <div :class="isOverdue(task.dueDate) ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'" class="p-1.5 rounded-lg">
                      <UIcon name="i-heroicons-calendar" class="w-4 h-4"/>
                   </div>
                   <div>
                     <div class="text-[10px] text-gray-500 uppercase tracking-wider">Hạn chót</div>
                     <div class="text-xs font-medium" :class="isOverdue(task.dueDate) ? 'text-red-500' : ''">
                        {{ formatDate(task.dueDate) }}
                     </div>
                   </div>
               </div>
            </div>
            
             <!-- Priority & Category tags at bottom -->
             <div class="flex justify-between items-center pt-1">
                <div v-if="task.category" class="flex items-center gap-1">
                   <UIcon :name="getCategoryIcon(task.category)" class="w-3.5 h-3.5 text-primary-500" />
                   <span class="text-[10px] text-gray-600 dark:text-gray-400 font-medium">{{ getCategoryLabel(task.category) }}</span>
                </div>
                <div v-else></div>
                <UBadge :color="priorityBadge(task.priority).color" variant="soft" size="xs" class="flex items-center gap-1">
                  <UIcon name="i-heroicons-flag" class="w-3 h-3" />
                  {{ priorityBadge(task.priority).label }}
               </UBadge>
            </div>
         </div>
      </div>

      <!-- Pagination -->
      <div class="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end" v-if="totalTasks > 0">
        <AppPagination v-model="page" :limit="limit" :total="totalTasks" />
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
         
         <div class="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
            <div class="relative w-full h-[100dvh] sm:h-auto max-w-lg transform bg-white dark:bg-gray-900 p-4 sm:p-6 text-left shadow-2xl transition-all sm:rounded-xl border-0 sm:border border-gray-100 dark:border-gray-700 flex flex-col">
               <!-- Header -->
               <div class="flex items-center justify-between mb-6">
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">Cập nhật Nhiệm vụ</h3>
                  <button @click="isEditModalOpen = false" class="text-gray-400 hover:text-gray-500">
                     <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
                  </button>
               </div>
               
               <!-- Body -->
               <!-- Body -->
               <div class="space-y-4">
                  <!-- Status (Everyone can edit) -->
                  <!-- Status (Everyone can edit) -->
                  <div>
                      <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Trạng thái</label>
                      <div class="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <button
                          v-for="status in [
                            { label: 'Cần làm', value: 'todo', activeColor: 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white' },
                            { label: 'Đang làm', value: 'in-progress', activeColor: 'bg-blue-500 text-white shadow-md' },
                            { label: 'Hoàn thành', value: 'done', activeColor: 'bg-green-500 text-white shadow-md' }
                          ]"
                          :key="status.value"
                          type="button"
                          @click="editingTask.status = status.value as any"
                          class="flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                          :class="editingTask.status === status.value ? status.activeColor : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'"
                        >
                          {{ status.label }}
                        </button>
                      </div>
                  </div>

                  <div>
                     <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tên nhiệm vụ</label>
                     <UInput class="w-full" v-model="editingTask.title" :disabled="userInfo.role === 'Member'" />
                  </div>
                  <div>
                     <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Miêu tả</label>
                     <UTextarea class="w-full" v-model="editingTask.description" :rows="3" :disabled="userInfo.role === 'Member'" />
                  </div>
                  <!-- Due Date -->
                  <div>
                      <label class="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Hạn chót</label>
                      <UInput v-model="editingTask.dueDate" type="date" class="w-full" size="lg" :disabled="userInfo.role === 'Member'" />
                  </div>

                  <!-- Priority -->
                  <div>
                      <label class="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Độ ưu tiên</label>
                      <div class="grid grid-cols-3 gap-3">
                        <button 
                          type="button" 
                          v-for="p in priorities" 
                          :key="p.value"
                          @click="userInfo.role !== 'Member' && (editingTask.priority = p.value)"
                          class="flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all duration-200"
                          :class="[
                            editingTask.priority === p.value 
                              ? 'ring-2 ring-primary-500 border-transparent bg-primary-50 dark:bg-primary-900/20' 
                              : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:border-primary-200 hover:bg-gray-50 dark:hover:bg-gray-800/80',
                            userInfo.role === 'Member' ? 'opacity-50 cursor-not-allowed' : ''
                          ]"
                        >
                           <div 
                              class="w-3 h-3 rounded-full mb-2"
                              :class="{
                                'bg-red-500': p.value === 'high',
                                'bg-orange-500': p.value === 'medium',
                                'bg-green-500': p.value === 'low'
                              }"
                           ></div>
                           <span class="text-sm font-semibold" :class="editingTask.priority === p.value ? 'text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'">{{ p.label }}</span>
                        </button>
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
  id: string
  name: string
  avatar: string
  departmentId: string
  departmentName: string
}

interface Department {
  id: string
  name: string
}

interface Task {
  id: string
  title: string
  description: string
  assigneeId: string | null
  priority: 'low' | 'medium' | 'high'
  category?: 'video' | 'image' | 'document' | 'business' | 'design' | 'development' | 'marketing' | 'admin' | 'other'
  dueDate: string
  status: 'todo' | 'in-progress' | 'done'
}

type Priority = 'low' | 'medium' | 'high'

interface CategoryItem {
  id: string
  name: string
  icon: string
  color: string
  is_default: boolean
}

const priorities: { value: Priority, label: string, activeClass: string }[] = [
  { value: 'high', label: 'Cao', activeClass: 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30' },
  { value: 'medium', label: 'Trung bình', activeClass: 'border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-900/30' },
  { value: 'low', label: 'Thấp', activeClass: 'border-gray-500 bg-gray-100 text-gray-700 dark:bg-gray-700/50' }
]

// --- State ---
const isSubmitting = ref(false)
const isAssigneeDropdownOpen = ref(false)
const assigneeDropdownRef = ref<HTMLElement | null>(null)
const assigneeSearchQuery = ref('')
const assigneeDeptFilter = ref<string | 'all'>('all')
const taskListSearch = ref('')

// Category Dropdown State
const isCategoryDropdownOpen = ref(false)
const categoryDropdownRef = ref<HTMLElement | null>(null)
const categorySearchQuery = ref('')
const categoryFilterQuery = ref('')

const isEditModalOpen = ref(false)
const editingTask = reactive<Task>({
   id: '', title: '', description: '', assigneeId: null, priority: 'medium', category: undefined, dueDate: '', status: 'todo'
})

const newTask = reactive({
  title: '',
  description: '',
  assigneeId: null as string | null,
  priority: 'medium' as Priority,
  category: undefined as string | undefined,
  dueDate: ''
})

// --- User Role ---
const userInfo = ref({ role: 'Owner' })
const { data: authData } = await useFetch<any>('/api/auth/me')
if(authData.value && authData.value.success) {
   userInfo.value = authData.value.user
}

// --- Data Fetching ---
// Fetch Departments
const { data: deptData } = await useFetch<Department[]>('/api/departments')
const departments = computed(() => deptData.value || [])

// Fetch Categories
const { data: categoriesData } = await useFetch<CategoryItem[]>('/api/categories')
const categories = computed(() => categoriesData.value || [])

const filteredCategories = computed(() => {
  if (!categoryFilterQuery.value) return categories.value
  const q = categoryFilterQuery.value.toLowerCase()
  return categories.value.filter(c => c.name.toLowerCase().includes(q))
})

// Fetch Employees
const { data: empData } = await useFetch<any[]>('/api/members')
const employees = computed(() => {
   if (!empData.value) return []
   return empData.value.map(e => ({
      id: e.id,
      name: e.name,
      avatar: e.avatar,
      departmentId: e.department_id,
      departmentName: getDepartmentName(e.department_id)
   }))
})

// Fetch Tasks
// Fetch Tasks (Server-side Pagination & Search)
const page = ref(1)
const limit = ref(20)
// taskListSearch is already defined, let's just use it but with debounce ideally, or just bind
// The user said: "phần table... search cũng phải tìm trên server"

// We use `taskListSearch` as the search term. 
// We should debounce this in a real app, but for now direct binding in useFetch params works.

const queryParams = computed(() => ({
    page: page.value,
    limit: limit.value,
    search: taskListSearch.value
}))

const { data: tasksData, refresh: refreshTasks, status: fetchStatus } = await useFetch<any>('/api/tasks', {
    query: queryParams
})

// Map API response to UI Task interface (snake_case -> camelCase)
const tasks = computed<Task[]>(() => {
   if(!tasksData.value || !tasksData.value.data) return []
   return tasksData.value.data.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      assigneeId: t.assignee_id,
      priority: t.priority,
      category: t.category,
      dueDate: t.due_date,
      status: t.status
   }))
})
const totalTasks = computed(() => tasksData.value?.total || 0)


// --- Computed ---
const filteredEmployees = computed(() => {
  let list = employees.value // use .value
  
  if (assigneeDeptFilter.value !== 'all') {
    list = list.filter(e => e.departmentId === assigneeDeptFilter.value)
  }
  
  if (assigneeSearchQuery.value) {
    const q = assigneeSearchQuery.value.toLowerCase()
    list = list.filter(e => e.name.toLowerCase().includes(q))
  }
  
  return list
})

// filteredTasks is no longer needed for CLIENT SIDE filtering of tasks, 
// BUT the table uses `filteredTasks`. 
// Since server returns already filtered results, `filteredTasks` should just return `tasks.value`.
const filteredTasks = computed(() => {
   return tasks.value
})

// --- Helpers ---
const getDepartmentName = (id: string) => {
   const d = departments.value.find(dept => dept.id === id)
   return d ? d.name : 'Unknown'
}

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

const getEmployee = (id: string | null) => employees.value.find(e => e.id === id)

const getCategoryIcon = (catId: string | undefined) => {
   if (!catId) return 'i-heroicons-tag'
   const found = categories.value.find(c => c.id === catId)
   return found ? found.icon : 'i-heroicons-tag'
}

const getCategoryLabel = (catId: string | undefined) => {
   if (!catId) return '-'
   const found = categories.value.find(c => c.id === catId)
   return found ? found.name : catId
}

const getCategoryColor = (catId: string | undefined) => {
   if (!catId) return '#64748B'
   const found = categories.value.find(c => c.id === catId)
   return found ? found.color : '#64748B'
}

const priorityBadge = (p: Priority) => {
   switch(p) {
      case 'high': return { label: 'Cao', color: 'error' as const }
      case 'medium': return { label: 'Trung bình', color: 'warning' as const }
      case 'low': return { label: 'Thấp', color: 'neutral' as const }
   }
}

// --- Actions ---
const toast = useToast()

const selectAssignee = (emp: Employee) => {
  newTask.assigneeId = emp.id
  assigneeSearchQuery.value = emp.name
  isAssigneeDropdownOpen.value = false
}

const handleAssigneeSearchInput = () => {
  if (newTask.assigneeId) {
     const selected = employees.value.find(e => e.id === newTask.assigneeId)
     if (selected && selected.name !== assigneeSearchQuery.value) {
        newTask.assigneeId = null
     }
  }
}

// Category Selection Functions
const selectCategory = (cat: CategoryItem) => {
  newTask.category = cat.id
  categorySearchQuery.value = cat.name
  isCategoryDropdownOpen.value = false
  categoryFilterQuery.value = ''
}

const clearCategory = () => {
  newTask.category = undefined
  categorySearchQuery.value = ''
  isCategoryDropdownOpen.value = false
  categoryFilterQuery.value = ''
}

const handleCategorySearchInput = () => {
  // No-op since we use readonly input
}

const createTask = async () => {
   if(!newTask.title || !newTask.assigneeId || !newTask.dueDate) return
   isSubmitting.value = true
   
   try {
     await $fetch('/api/tasks', {
       method: 'POST',
       body: {
         title: newTask.title,
         description: newTask.description,
         assignee_id: newTask.assigneeId,
         priority: newTask.priority,
         category: newTask.category,
         due_date: newTask.dueDate
       }
     })
     
     toast.add({ title: 'Thành công', description: 'Đã giao nhiệm vụ', color: 'success' })
     await refreshTasks()
     
     // Reset
     newTask.title = ''
     newTask.description = ''
     newTask.assigneeId = null
     assigneeSearchQuery.value = ''
     newTask.priority = 'medium'
     newTask.category = undefined
     categorySearchQuery.value = ''
     newTask.dueDate = ''
   } catch (error: any) {
      toast.add({ title: 'Lỗi', description: error.data?.message || 'Không thể tạo nhiệm vụ', color: 'error' })
   } finally {
     isSubmitting.value = false
   }
}

const openEditModal = (task: Task) => {
   // Copy logic
   editingTask.id = task.id
   editingTask.title = task.title
   editingTask.description = task.description
   editingTask.status = task.status
   editingTask.priority = task.priority
   editingTask.category = task.category
   editingTask.dueDate = task.dueDate
   editingTask.assigneeId = task.assigneeId
   editingTask.status = task.status
   
   isEditModalOpen.value = true
}

const updateTask = async () => {
   isSubmitting.value = true
   try {
     await $fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PUT',
        body: {
           title: editingTask.title,
           description: editingTask.description,
           priority: editingTask.priority,
           category: editingTask.category,
           due_date: editingTask.dueDate,
           status: editingTask.status
           // user cannot change assignee/status here in this minimal modal yet unless expanded
        }
     })
     toast.add({ title: 'Thành công', description: 'Đã cập nhật nhiệm vụ', color: 'success' })
     await refreshTasks()
     isEditModalOpen.value = false
   } catch (error: any) {
     toast.add({ title: 'Lỗi', description: error.data?.message || 'Không thể cập nhật', color: 'error' })
   } finally {
     isSubmitting.value = false
   }
}

// Click Outside
const handleClickOutside = (event: MouseEvent) => {
  if (assigneeDropdownRef.value && !assigneeDropdownRef.value.contains(event.target as Node)) {
    isAssigneeDropdownOpen.value = false
  }
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(event.target as Node)) {
    isCategoryDropdownOpen.value = false
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
