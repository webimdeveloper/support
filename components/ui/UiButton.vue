<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClass"
    v-bind="$attrs"
  >
    <span v-if="loading" class="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
})

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'px-3 py-1.5 text-sm'
  if (props.size === 'lg') return 'px-5 py-3 text-base'
  return 'px-4 py-2 text-sm'
})

const variantClass = computed(() => {
  if (props.variant === 'secondary') return 'bg-gray-100 hover:bg-gray-200 text-gray-900'
  if (props.variant === 'danger') return 'bg-red-600 hover:bg-red-700 text-white'
  if (props.variant === 'ghost') return 'bg-transparent hover:bg-gray-100 text-gray-900 dark:hover:bg-gray-700 dark:text-white'
  return 'bg-blue-600 hover:bg-blue-700 text-white'
})

const buttonClass = computed(() => [
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  sizeClass.value,
  variantClass.value,
])
</script>
