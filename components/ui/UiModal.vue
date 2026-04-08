<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50" @click.self="$emit('close')">
      <div class="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'close'): void
}>()

defineProps<{
  open: boolean
}>()
</script>
