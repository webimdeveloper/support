<template>
  <span :class="badgeClass">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  tone?: 'success' | 'info' | 'neutral' | 'danger'
}>(), {
  tone: 'neutral',
})

const badgeClass = computed(() => {
  if (props.tone === 'success') return 'px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800'
  if (props.tone === 'info') return 'px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800'
  if (props.tone === 'danger') return 'px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800'
  return 'px-2 py-1 rounded-md text-xs font-medium bg-gray-200 text-gray-800'
})
</script>
