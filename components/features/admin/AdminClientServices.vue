<template>
  <div class="space-y-2">
    <div
      v-for="service in services"
      :key="service.key"
      class="rounded-md border border-gray-200 p-2 dark:border-gray-700"
    >
      <div class="mb-2 flex items-center gap-2">
        <span class="text-xs font-semibold uppercase text-gray-600 dark:text-gray-300">{{ serviceLabel(service.key) }}</span>
        <UiBadge :tone="service.configured ? 'success' : 'neutral'">
          {{ service.configured ? 'Configured' : 'Missing config' }}
        </UiBadge>
        <UiBadge :tone="service.connected ? 'success' : 'danger'">
          {{ service.connected ? 'Connected' : 'Disconnected' }}
        </UiBadge>
      </div>
      <UiSelect
        :model-value="service.managementMode"
        :options="managementOptions"
        :disabled="disabled"
        size="sm"
        @update:model-value="onModeChange(service.key, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClientServiceStatus, ServiceKey, ServiceManagementMode } from './types'

const props = defineProps<{
  services: ClientServiceStatus[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update-mode', payload: { service: ServiceKey; managementMode: ServiceManagementMode }): void
}>()

const managementOptions = [
  { label: 'Client connects inside dashboard', value: 'client_self_service' },
  { label: 'Admin manages this service', value: 'admin_managed' },
]

const serviceLabel = (key: ServiceKey) => {
  if (key === 'gtm') return 'GTM'
  if (key === 'ga4') return 'GA4'
  return 'GSC'
}

const onModeChange = (service: ServiceKey, value: string) => {
  const managementMode: ServiceManagementMode = value === 'admin_managed' ? 'admin_managed' : 'client_self_service'
  emit('update-mode', { service, managementMode })
}
</script>
