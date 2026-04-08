<template>
  <NuxtLink v-if="internal" :to="to" class="text-blue-600 hover:text-blue-800 hover:underline" v-bind="$attrs">
    <slot />
  </NuxtLink>
  <a v-else :href="href" class="text-blue-600 hover:text-blue-800 hover:underline" v-bind="$attrs">
    <slot />
  </a>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  internal?: boolean
  to?: string
  href?: string
}>(), {
  internal: false,
  to: '/',
  href: '#',
})
</script>
