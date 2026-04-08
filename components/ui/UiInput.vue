<template>
  <div>
    <label v-if="label" :for="id" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClass"
      :aria-invalid="error ? 'true' : 'false'"
      v-bind="$attrs"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const props = withDefaults(defineProps<{
  modelValue: string
  id?: string
  label?: string
  type?: string
  placeholder?: string
  disabled?: boolean
  error?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  id: undefined,
  label: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  error: '',
  size: 'md',
})

const inputClass = computed(() => {
  const sizeClass = props.size === 'sm' ? 'px-2 py-1 text-sm' : props.size === 'lg' ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm'
  const stateClass = props.error
    ? 'border-red-500 focus:ring-red-500'
    : 'border-gray-300 focus:ring-blue-500 dark:border-gray-600'

  return `w-full rounded-md border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${sizeClass} ${stateClass}`
})
</script>
