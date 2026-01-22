<template>
  <nav class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pb-safe shadow-top-lg">
    <div class="grid grid-cols-4 h-16">
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="flex flex-col items-center justify-center gap-1 text-xs font-medium transition-all duration-200"
        :class="[
          isActive(link.to) 
            ? 'text-primary-600 dark:text-primary-400' 
            : 'text-gray-600 dark:text-gray-400'
        ]"
      >
        <div 
          class="flex items-center justify-center transition-all duration-200"
          :class="isActive(link.to) ? 'scale-110' : 'scale-100'"
        >
          <UIcon :name="link.icon" class="w-6 h-6" />
        </div>
        <span 
          class="text-[10px] leading-tight text-center"
          :class="isActive(link.to) ? 'font-bold' : 'font-medium'"
        >
          {{ link.label }}
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps<{
  links: any[]
}>()

const route = useRoute()

// Simple active state check
const isActive = (path: string) => route.path === path
</script>

<style scoped>
.shadow-top-lg {
  box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.05), 0 -2px 4px -1px rgba(0, 0, 0, 0.03);
}
</style>
