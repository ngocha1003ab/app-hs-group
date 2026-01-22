<template>
  <div class="max-w-7xl mx-auto">
    <!-- Page Header -->
    <div class="mb-8 md:mb-10">
      <h1 class="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
        Tổng quan
      </h1>
      <p class="text-gray-500 dark:text-gray-400 mt-2 text-lg">
        Chào mừng trở lại, đây là báo cáo hoạt động của bạn.
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <UCard 
        v-for="item in 4" 
        :key="item" 
        class="group ring-1 ring-gray-200 dark:ring-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        <div class="p-2 sm:p-2">
          <div class="flex items-start justify-between">
            <div class="space-y-1">
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Doanh thu</p>
              <p class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">12.5M ₫</p>
            </div>
            <div class="p-2.5 bg-primary-50 dark:bg-primary-900/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
              <UIcon name="i-heroicons-currency-dollar" class="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <div class="mt-4 flex items-center text-sm">
            <span class="text-emerald-600 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">
              <UIcon name="i-heroicons-arrow-trending-up" class="w-4 h-4" />
              12.5%
            </span>
            <span class="text-gray-500 ml-2">so với tháng trước</span>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Recent Activity -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between p-2">
          <div class="space-y-1">
            <h3 class="font-bold text-xl text-gray-900 dark:text-white">Hoạt động gần đây</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">5 giao dịch mới nhất trong ngày</p>
          </div>
          <UButton variant="soft" color="neutral" size="sm">Xem tất cả</UButton>
        </div>
      </template>
      
      <div class="divide-y divide-gray-100 dark:divide-gray-800 p-2">
        <div v-for="i in 5" :key="i" class="flex items-center gap-4 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 -mx-4 px-4 transition-colors rounded-lg">
          <UAvatar :alt="`User ${i}`" size="md" class="bg-gray-100 ring-2 ring-white dark:ring-gray-900" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-gray-900 dark:text-white truncate">
              Nguyễn Văn A đã thanh toán hóa đơn
            </p>
            <p class="text-xs text-gray-500 mt-0.5">Vừa xong • Qua chuyển khoản</p>
          </div>
          <span class="text-sm font-bold text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
            -250.000 ₫
          </span>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'app'
})

// Optional: Dynamic Title
useHead({
  title: 'Dashboard - SheetVN'
})
</script>
