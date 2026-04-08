<template>
  <UiTable>
    <table class="w-full">
      <thead class="bg-gray-100 dark:bg-gray-700">
        <tr>
          <th class="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
            <input type="checkbox" aria-label="Select all clients" class="h-4 w-4 rounded border-gray-300" />
          </th>
          <th class="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Client</th>
          <th class="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Project</th>
          <th class="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
          <th class="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Created</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
        <tr
          v-for="client in clients"
          :key="client.id"
          class="hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
            <UiCheckbox v-model="client.selected" :aria-label="`Select ${client.name}`" />
          </td>
          <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
            <UiInput
              v-if="client.isClientEditing"
              v-model="client.clientInput"
              list="client-suggestions"
              placeholder="Type to pick existing or add new client"
              size="sm"
            />
            <UiLink
              v-else
              internal
              :to="`/${client.slug || '#'}`"
            >
              {{ client.name }}
            </UiLink>
          </td>
          <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
            <UiInput
              v-if="client.isProjectEditing"
              v-model="client.projectInput"
              type="url"
              placeholder="https://project-url.com"
              size="sm"
              @keydown.enter.prevent="$emit('save-project', client)"
            />
            <UiLink
              v-else
              :href="client.siteUrl"
              @click="$emit('project-click', $event, client)"
              @dblclick.prevent="$emit('enable-project-edit', client)"
            >
              {{ client.siteUrl }}
            </UiLink>
          </td>
          <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
            <UiBadge :tone="statusTone[client.status]">
              {{ client.status }}
            </UiBadge>
          </td>
          <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{{ client.createdAt }}</td>
        </tr>
      </tbody>
    </table>
  </UiTable>
</template>

<script setup lang="ts">
import type { ClientRow, ClientStatus } from './types'

defineEmits<{
  (e: 'save-project', client: ClientRow): void
  (e: 'project-click', event: MouseEvent, client: ClientRow): void
  (e: 'enable-project-edit', client: ClientRow): void
}>()

defineProps<{
  clients: ClientRow[]
  statusTone: Record<ClientStatus, 'success' | 'info' | 'neutral'>
}>()
</script>
