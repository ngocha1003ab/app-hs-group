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

    <!-- 2.5. Additional Charts Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Pie Chart: Task Status Distribution -->
      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800">
        <template #header>
          <div class="px-4 py-3">
            <h3 class="text-base font-bold text-gray-900 dark:text-white">Phân bố trạng thái</h3>
          </div>
        </template>
        <div class="h-56 w-full relative px-4 pb-4 flex items-center justify-center">
          <ClientOnly>
            <div class="w-full h-full max-w-[200px] mx-auto">
              <Pie :data="pieChartData" :options="pieChartOptions" />
            </div>
            <template #fallback>
              <div class="flex items-center justify-center h-full text-gray-400 text-sm">Đang tải...</div>
            </template>
          </ClientOnly>
        </div>
      </UCard>

      <!-- Doughnut Chart: Department Distribution -->
      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800">
        <template #header>
          <div class="px-4 py-3">
            <h3 class="text-base font-bold text-gray-900 dark:text-white">Phân bố bộ phận</h3>
          </div>
        </template>
        <div class="h-56 w-full relative px-4 pb-4 flex items-center justify-center">
          <ClientOnly>
            <div class="w-full h-full max-w-[200px] mx-auto">
              <Doughnut :data="doughnutChartData" :options="doughnutChartOptions" />
            </div>
            <template #fallback>
              <div class="flex items-center justify-center h-full text-gray-400 text-sm">Đang tải...</div>
            </template>
          </ClientOnly>
        </div>
      </UCard>

      <!-- Line Chart: Completion Trend (7 days) -->
      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800">
        <template #header>
          <div class="px-4 py-3">
            <h3 class="text-base font-bold text-gray-900 dark:text-white">Xu hướng hoàn thành</h3>
          </div>
        </template>
        <div class="h-56 w-full relative px-4 pb-4">
          <ClientOnly>
            <Line :data="lineChartData" :options="lineChartOptions" />
            <template #fallback>
              <div class="flex items-center justify-center h-full text-gray-400 text-sm">Đang tải...</div>
            </template>
          </ClientOnly>
        </div>
      </UCard>

      <!-- Horizontal Bar Chart: Top Assignees -->
      <UCard class="ring-1 ring-gray-200 dark:ring-gray-800">
        <template #header>
          <div class="px-4 py-3">
            <h3 class="text-base font-bold text-gray-900 dark:text-white">Top người thực hiện</h3>
          </div>
        </template>
        <div class="h-56 w-full relative px-4 pb-4">
          <ClientOnly>
            <Bar :data="horizontalBarChartData" :options="horizontalBarChartOptions" />
            <template #fallback>
              <div class="flex items-center justify-center h-full text-gray-400 text-sm">Đang tải...</div>
            </template>
          </ClientOnly>
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
  ArcElement,
  LineElement,
  PointElement,
  type ChartData,
  type ChartOptions
} from 'chart.js'
import { Bar, Pie, Doughnut, Line } from 'vue-chartjs'

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Title, Tooltip, Legend)

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

// --- Mock Data Integration ---
const { tasks, employees, departments } = useMockData()

// --- 1. Period Stats (Calculated from Mock Tasks + Some fake volume for 'Total') ---
const periodStats = computed(() => {
  // Fake numbers to look impressive
  return { 
    total: 128, 
    inProgress: tasks.value.filter(t => t.status === 'in-progress').length + 42, 
    completed: tasks.value.filter(t => t.status === 'done').length + 80, 
    overdue: tasks.value.filter(t => new Date(t.due_date) < new Date() && t.status !== 'done').length 
  }
})

// --- 2. Chart Data (Hardcoded for aesthetics) ---
const chartData = computed<ChartData<'bar'>>(() => ({
  labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
  datasets: [{
    label: 'Hoàn thành',
    backgroundColor: '#10B981',
    data: [12, 19, 15, 25, 22, 10, 14],
    barPercentage: 0.7,
    categoryPercentage: 0.8,
    borderRadius: 4,
    barThickness: 24
  }]
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { 
      beginAtZero: true, 
      grid: { color: '#f3f4f6' },
      ticks: { font: { family: 'Inter' } }
    },
    x: { 
      grid: { display: false },
      ticks: { font: { family: 'Inter' } }
    }
  }
}))

// --- 3. Pie Chart (Status) ---
const pieChartData = computed<ChartData<'pie'>>(() => ({
  labels: ['Đang làm', 'Hoàn thành', 'Chưa làm', 'Quá hạn'],
  datasets: [{
    backgroundColor: ['#3B82F6', '#10B981', '#E5E7EB', '#EF4444'],
    data: [35, 45, 15, 5],
    borderWidth: 0
  }]
}))

const pieChartOptions = computed<ChartOptions<'pie'>>(() => ({
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } }
  }
}))

// --- 4. Doughnut Chart (Departments) ---
const doughnutChartData = computed<ChartData<'doughnut'>>(() => ({
  labels: ['Kinh doan', 'Marketing', 'Kỹ thuật', 'Nhân sự', 'Khác'],
  datasets: [{
    backgroundColor: ['#F59E0B', '#EC4899', '#6366F1', '#8B5CF6', '#9CA3AF'],
    data: [30, 25, 20, 15, 10],
    borderWidth: 0
  }]
}))

const doughnutChartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: true,
  cutout: '75%',
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8 } }
  }
}))

// --- 5. Line Chart (Trend) ---
const lineChartData = computed<ChartData<'line'>>(() => {
  // Generate last 7 days labels
  const labels: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    labels.push(`${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`)
  }
  
  return {
    labels,
    datasets: [{
      label: 'Hoàn thành',
      borderColor: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      data: [3, 5, 2, 8, 6, 4, 7],
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#10B981',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  }
})

const lineChartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 12,
      titleFont: { size: 13, weight: '600' },
      bodyFont: { size: 12 }
    }
  },
  scales: {
    x: { 
      display: true,
      grid: { display: false },
      ticks: { font: { size: 10 } }
    },
    y: { 
      display: true,
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { 
        font: { size: 10 },
        stepSize: 2
      }
    }
  },
  elements: {
    line: { borderWidth: 3 }
  }
}))

// --- 6. Horizontal Bar (Top Assignees) ---
const horizontalBarChartData = computed<ChartData<'bar'>>(() => {
  // Get employees with task counts
  const empList = employees.value.slice(0, 5)
  const taskCounts = empList.map((emp, i) => 20 - (i * 3)) // Mock decreasing counts
  
  return {
    labels: empList.map(e => e.name),
    datasets: [{
      label: 'Công việc hoàn thành',
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)'
      ],
      data: taskCounts,
      borderRadius: 6,
      barThickness: 20
    }]
  }
})

const horizontalBarChartOptions = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: { 
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      padding: 10
    }
  },
  scales: {
    x: { 
      display: true,
      beginAtZero: true,
      grid: { color: 'rgba(0,0,0,0.05)' },
      ticks: { font: { size: 10 } }
    },
    y: { 
      grid: { display: false },
      ticks: { 
        font: { size: 11, weight: '500' as const },
        padding: 8
      }
    }
  }
}))

// --- 7. Lists Logic ---
const overdueTasks = computed(() => {
    // Filter actual mocked tasks that are overdue
    const now = new Date()
    return tasks.value.filter(t => {
        const dueDate = new Date(t.due_date)
        return t.status !== 'done' && dueDate < now
    }).map(t => {
        const emp = employees.value.find(e => e.id === t.assignee_id) || employees.value[0]
        const dept = departments.value.find(d => d.id === t.department_id) || departments.value[0]
        const diff = Math.ceil((now.getTime() - new Date(t.due_date).getTime()) / (1000 * 3600 * 24))
        return {
            id: t.id,
            name: t.title,
            daysOverdue: diff,
            assignee: { name: emp.name, avatar: emp.avatar },
            department: dept.name
        }
    })
})

const topDepartments = computed(() => {
    return departments.value.slice(0, 3).map((d, i) => ({
        name: d.name,
        completed: 120 - (i * 20),
        score: 100 - (i * 10)
    }))
})

const topEmployees = computed(() => {
    return employees.value.slice(0, 4).map((e, i) => ({
        id: e.id,
        name: e.name,
        avatar: e.avatar,
        department: departments.value.find(d => d.id === e.department_id)?.name,
        tasks: 45 - (i * 5)
    }))
})
</script>
