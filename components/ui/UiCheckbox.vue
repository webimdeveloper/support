<template>
  <input
    :checked="modelValue"
    type="checkbox"
    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    :aria-label="ariaLabel"
    v-bind="$attrs"
    @change="$emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
  />
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

withDefaults(defineProps<{
  modelValue: boolean
  ariaLabel?: string
}>(), {
  ariaLabel: 'Checkbox',
})
</script>
