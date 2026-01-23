<template>
  <div class="flex flex-wrap items-center justify-center gap-2" v-if="totalPages > 1">
    <!-- Prev -->
    <button
      type="button"
      @click="changePage(currentPage - 1)"
      :disabled="currentPage === 1"
      class="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      aria-label="Previous page"
    >
      <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
    </button>

    <!-- Pages -->
    <template v-for="(p, index) in pages" :key="index">
      <span 
        v-if="p === '...'" 
        class="px-2 text-gray-400 text-sm"
      >...</span>
      
      <button
        v-else
        type="button"
        @click="changePage(p as number)"
        class="min-w-[36px] h-9 flex items-center justify-center px-3 rounded-lg text-sm font-medium transition-colors border"
        :class="[
          currentPage === p
            ? 'bg-primary-600 border-primary-600 text-white shadow-md'
            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
        ]"
      >
        {{ p }}
      </button>
    </template>

    <!-- Next -->
    <button
      type="button"
      @click="changePage(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-500 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      aria-label="Next page"
    >
      <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: number
  total: number
  limit: number
}>()

const emit = defineEmits(['update:modelValue', 'change'])

const currentPage = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)
    emit('change', val)
  }
})

const totalPages = computed(() => Math.ceil(props.total / props.limit))

const pages = computed(() => {
  const current = currentPage.value
  const total = totalPages.value
  const delta = 2
  const range = []
  const rangeWithDots: (number | string)[] = []
  let l: number | undefined

  range.push(1)

  for (let i = current - delta; i <= current + delta; i++) {
    if (i < total && i > 1) {
      range.push(i)
    }
  }

  range.push(total)

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1)
      } else if (i - l !== 1) {
        rangeWithDots.push('...')
      }
    }
    rangeWithDots.push(i)
    l = i
  }

  return rangeWithDots
})

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page
    // window.scrollTo({ top: 0, behavior: 'smooth' }) // Optional: Scroll to top
  }
}
</script>
