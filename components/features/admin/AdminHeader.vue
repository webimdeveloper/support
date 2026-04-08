<template>
  <div class="flex justify-between items-center mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
    <UiButton @click="$emit('logout')" variant="danger">
      Logout
    </UiButton>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'logout'): void
}>()
</script>
