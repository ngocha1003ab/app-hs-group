<template>
  <UApp>
    <NuxtLayout>
      <NuxtRouteAnnouncer />
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
// Global configuration
onMounted(() => {
  // Disable spellcheck for all inputs on mount and future inputs
  document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      target.setAttribute('spellcheck', 'false')
    }
  })
})
</script>

