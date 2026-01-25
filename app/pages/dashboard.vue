<template>
  <div class="max-w-7xl mx-auto space-y-6 md:space-y-8">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Thống kê
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">
          Tổng hợp tình hình công việc và hiệu suất.
        </p>
      </div>
      
      <!-- Time Filter -->
      <div class="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <button 
          v-for="period in periods" 
          :key="period.value"
          @click="selectedPeriod = period.value"
          class="px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200"
          :class="selectedPeriod === period.value ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'"
        >
          {{ period.label }}
        </button>
      </div>
    </div>

    <!-- 1. Stats Grid (4 Blocks) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm">
        <div class="p-3 sm:p-6">
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">Tổng công việc</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ periodStats.total }}</p>
            </div>
            <div class="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <UIcon name="i-heroicons-clipboard-document-list" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm">
        <div class="p-3 sm:p-6">
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium text-yellow-600 dark:text-yellow-400 uppercase">Đang làm</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ periodStats.inProgress }}</p>
            </div>
            <div class="p-2.5 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <UIcon name="i-heroicons-clock" class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm">
        <div class="p-3 sm:p-6">
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium text-green-600 dark:text-green-400 uppercase">Đã hoàn thành</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ periodStats.completed }}</p>
            </div>
            <div class="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <UIcon name="i-heroicons-check-badge" class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </UCard>

      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm">
        <div class="p-3 sm:p-6">
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium text-red-600 dark:text-red-400 uppercase">Quá hạn</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white">{{ periodStats.overdue }}</p>
            </div>
            <div class="p-2.5 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- 2. Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <!-- Chart Column (Takes 2/3 width on large screens) -->
      <UCard class="lg:col-span-2 ring-1 ring-gray-200 dark:ring-gray-800">
        <template #header>
          <div class="px-3 py-2 sm:px-6 sm:py-4">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Công việc hoàn thành ({{ selectedPeriodLabel }})</h3>
          </div>
        </template>
        <div class="h-80 w-full relative p-3 sm:p-6">
          <ClientOnly>
             <Bar :data="chartData" :options="chartOptions" />
             <template #fallback>
                <div class="flex items-center justify-center h-full text-gray-400">Đang tải biểu đồ...</div>
             </template>
          </ClientOnly>
        </div>
      </UCard>

      <!-- Overdue Tasks List (Takes 1/3 width) -->
      <UCard class="lg:col-span-1 ring-1 ring-gray-200 dark:ring-gray-800 h-full">
        <template #header>
          <div class="flex items-center justify-between px-3 py-2 sm:px-6 sm:py-4">
             <h3 class="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <UIcon name="i-heroicons-fire" class="w-5 h-5"/>
                Cần xử lý gấp
             </h3>
             <UBadge color="error" variant="soft" size="sm">10</UBadge>
          </div>
        </template>
        <div v-if="overdueTasks.length > 0" class="space-y-4 p-3 sm:p-6">
          <div v-for="task in overdueTasks" :key="task.id" class="p-3 rounded-lg border border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/10">
            <div class="flex justify-between items-start mb-1">
               <h4 class="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{{ task.name }}</h4>
               <span class="text-xs font-bold text-red-600 dark:text-red-400 whitespace-nowrap">{{ task.daysOverdue }} ngày</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2">
               <UAvatar :src="task.assignee.avatar" size="2xs" />
               <span class="font-medium">{{ task.assignee.name }}</span>
               <span class="text-gray-300 dark:text-gray-600">•</span>
               <span>{{ task.department }}</span>
            </div>
          </div>
        </div>
        <div v-else class="p-3 sm:p-6 h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 min-h-[200px]">
           <UIcon name="i-heroicons-clipboard-document-check" class="w-12 h-12 mb-2 text-gray-300 dark:text-gray-600" />
           <p class="text-sm">Không có công việc quá hạn.</p>
        </div>
      </UCard>
    </div>

    <!-- 3. Rankings Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
       <!-- Top Departments -->
       <UCard class="ring-1 ring-gray-200 dark:ring-gray-800">
         <template #header>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Top Bộ Phận Hiệu Quả</h3>
         </template>
         <div v-if="topDepartments.length > 0" class="space-y-4">
            <div v-for="(dept, index) in topDepartments" :key="dept.name" class="flex items-center gap-4">
               <div class="flex-none w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 font-bold text-sm" :class="index === 0 ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-500'">
                  {{ index + 1 }}
               </div>
               <div class="flex-1">
                  <div class="flex justify-between mb-1">
                     <span class="text-sm font-medium text-gray-900 dark:text-white">{{ dept.name }}</span>
                     <span class="text-sm font-bold text-primary-600">{{ dept.completed }} xong</span>
                  </div>
                  <UProgress :value="dept.score" color="primary" size="sm" />
               </div>
            </div>
         </div>
         <div v-else class="flex flex-col items-center justify-center py-8 text-center text-gray-400 dark:text-gray-500">
            <UIcon name="i-heroicons-chart-bar" class="w-10 h-10 mb-2 text-gray-300 dark:text-gray-600" />
            <p class="text-sm">Chưa có dữ liệu xếp hạng bộ phận.</p>
         </div>
       </UCard>

       <!-- Top Employees -->
       <UCard class="ring-1 ring-gray-200 dark:ring-gray-800">
         <template #header>
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Nhân Viên Xuất Sắc</h3>
         </template>
         <div v-if="topEmployees.length > 0" class="space-y-4">
            <div v-for="(emp, index) in topEmployees" :key="emp.id" class="flex items-center gap-4">
               <UAvatar :src="emp.avatar" :alt="emp.name" />
               <div class="flex-1">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ emp.name }}</p>
                  <p class="text-xs text-gray-500">{{ emp.department }}</p>
               </div>
               <div class="text-right">
                  <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">{{ emp.tasks }}</p>
                  <p class="text-xs text-gray-400">công việc</p>
               </div>
            </div>
         </div>
         <div v-else class="flex flex-col items-center justify-center py-8 text-center text-gray-400 dark:text-gray-500">
            <UIcon name="i-heroicons-user-group" class="w-10 h-10 mb-2 text-gray-300 dark:text-gray-600" />
            <p class="text-sm">Chưa có dữ liệu xếp hạng nhân viên.</p>
         </div>
       </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import { Bar } from 'vue-chartjs'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

definePageMeta({
  layout: 'app'
})

useHead({
  title: 'Thống kê - SheetVN'
})

// --- Filter State ---
type Period = 'today' | 'yesterday' | '7days' | '1month'

const selectedPeriod = ref<Period>('7days')

const periods: { label: string; value: Period }[] = [
  { label: 'Hôm nay', value: 'today' },
  { label: 'Hôm qua', value: 'yesterday' },
  { label: '7 ngày qua', value: '7days' },
  { label: '30 ngày qua', value: '1month' }
]

const selectedPeriodLabel = computed(() => {
  return periods.find(p => p.value === selectedPeriod.value)?.label || '7 ngày qua'
})

// --- Fetch Real Data ---
const { data, status, refresh } = await useFetch('/api/dashboard/stats', {
    query: { period: selectedPeriod },
    watch: [selectedPeriod]
})

// --- Stats Data ---
const periodStats = computed(() => {
    return data.value?.periodStats || { 
        total: 0, 
        inProgress: 0, 
        completed: 0, 
        overdue: 0 
    }
})

// --- Chart Data ---
const chartData = computed<ChartData<'bar'>>(() => {
    if (!data.value?.chartData) {
        return {
            labels: [],
            datasets: []
        }
    }
    // Ensure styles are consistent with square corners
    return {
        ...data.value.chartData,
        datasets: data.value.chartData.datasets.map((ds: any) => ({
             ...ds,
             barPercentage: 0.7,
             categoryPercentage: 0.8,
             borderRadius: 0,
             borderSkipped: false
        }))
    }
})

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
       display: true,
       position: 'bottom',
       labels: {
          usePointStyle: true,
          padding: 20
       }
    }
  },
  scales: {
    y: {
       beginAtZero: true,
       grid: {
          color: 'rgba(200, 200, 200, 0.1)'
       }
    },
    x: {
       grid: {
          display: false
       }
    }
  },
  elements: {
    bar: {
       borderRadius: 0
    }
  }
}))

// --- Lists ---
const overdueTasks = computed(() => data.value?.overdueTasks || [])
const topDepartments = computed(() => data.value?.topDepartments || [])
const topEmployees = computed(() => data.value?.topEmployees || [])

</script>
