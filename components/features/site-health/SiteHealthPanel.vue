<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold" style="color: var(--color-text)">GTM Insights</h2>
      <div class="flex items-center gap-2">
        <UiButton :disabled="connecting" @click="$emit('connect')">
          {{ connecting ? 'Opening Google...' : connected ? 'Reconnect Google' : 'Connect Google' }}
        </UiButton>
        <UiButton v-if="connected && isAdmin" variant="secondary" :disabled="loading" @click="$emit('disconnect')">Disconnect</UiButton>
        <UiButton v-if="isAdmin" :disabled="loading || !configured || !connected" @click="$emit('refresh')">
          {{ loading ? 'Updating...' : 'Update GTM Data' }}
        </UiButton>
      </div>
    </div>

    <div class="grid gap-2 md:grid-cols-3">
      <div class="rounded-lg border p-3 text-sm" style="border-color: var(--border-default); background: var(--color-bg)">
        <p class="font-medium gtm-text">GTM</p>
        <p class="gtm-muted text-xs">{{ services.gtm ? 'Configured' : 'Not configured' }}</p>
      </div>
      <div class="rounded-lg border p-3 text-sm" style="border-color: var(--border-default); background: var(--color-bg)">
        <p class="font-medium gtm-text">GA4</p>
        <p class="gtm-muted text-xs">{{ services.ga4 ? 'Configured' : 'Not configured' }}</p>
      </div>
      <div class="rounded-lg border p-3 text-sm" style="border-color: var(--border-default); background: var(--color-bg)">
        <p class="font-medium gtm-text">Search Console</p>
        <p class="gtm-muted text-xs">{{ services.gsc ? 'Configured' : 'Not configured' }}</p>
      </div>
    </div>

    <div v-if="isAdmin" class="grid gap-2 md:grid-cols-2 rounded-lg border p-3" style="border-color: var(--border-default); background: var(--color-bg)">
      <input v-model="draftIds.accountId" class="rounded border px-2 py-1 text-sm" style="border-color: var(--border-default); background: var(--color-bg); color: var(--color-text)" placeholder="GTM Account ID" />
      <input v-model="draftIds.containerId" class="rounded border px-2 py-1 text-sm" style="border-color: var(--border-default); background: var(--color-bg); color: var(--color-text)" placeholder="GTM Container ID" />
      <input v-model="draftIds.workspaceId" class="rounded border px-2 py-1 text-sm" style="border-color: var(--border-default); background: var(--color-bg); color: var(--color-text)" placeholder="GTM Workspace ID" />
      <input v-model="draftIds.ga4PropertyId" class="rounded border px-2 py-1 text-sm" style="border-color: var(--border-default); background: var(--color-bg); color: var(--color-text)" placeholder="GA4 Property ID" />
      <input v-model="draftIds.gscSiteUrl" class="rounded border px-2 py-1 text-sm md:col-span-2" style="border-color: var(--border-default); background: var(--color-bg); color: var(--color-text)" placeholder="Search Console Site URL" />
      <div class="md:col-span-2">
        <UiButton variant="secondary" :disabled="mappingSaving" @click="saveMapping">{{ mappingSaving ? 'Saving...' : 'Save mapping' }}</UiButton>
      </div>
    </div>

    <div
      v-if="!configured && !error"
      class="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200"
    >
      GTM is not configured for this client yet. Add GTM account/container/workspace IDs to the client record first.
    </div>

    <div v-else-if="!connected && !error" class="rounded-lg border p-4 text-sm" style="border-color: var(--border-default); color: var(--color-text-muted)">
      Google is not connected for this client yet. Use Connect Google to grant read-only access.
    </div>

    <div v-else-if="summary" class="space-y-3">
      <div class="grid gap-3 md:grid-cols-4">
        <button class="gtm-metric-card" :class="{ 'is-active': activeSeverity === 'all' }" @click="$emit('filter', 'all')">
          <p class="text-xs gtm-muted">Total tags</p>
          <p class="mt-1 text-2xl font-semibold gtm-text">{{ summary.totalTags }}</p>
        </button>
        <button class="gtm-metric-card" :class="{ 'is-active': activeSeverity === 'critical' }" @click="$emit('filter', 'critical')">
          <p class="text-xs gtm-muted">Paused tags</p>
          <p class="mt-1 text-2xl font-semibold gtm-text">{{ summary.pausedTags }}</p>
        </button>
        <button class="gtm-metric-card" :class="{ 'is-active': activeSeverity === 'ok' }" @click="$emit('filter', 'ok')">
          <p class="text-xs gtm-muted">Conversion triggers</p>
          <p class="mt-1 text-2xl font-semibold gtm-text">{{ summary.conversionTriggers }}</p>
        </button>
        <button class="gtm-metric-card" :class="{ 'is-active': activeSeverity === 'warning' }" @click="$emit('filter', 'warning')">
          <p class="text-xs gtm-muted">Variables defined</p>
          <p class="mt-1 text-2xl font-semibold gtm-text">{{ summary.variablesDefined }}</p>
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button class="gtm-pill" :class="{ 'is-active': activeSeverity === 'all' }" @click="$emit('filter', 'all')">All ({{ counts.all }})</button>
        <button class="gtm-pill critical" :class="{ 'is-active': activeSeverity === 'critical' }" @click="$emit('filter', 'critical')">Critical ({{ counts.critical }})</button>
        <button class="gtm-pill warning" :class="{ 'is-active': activeSeverity === 'warning' }" @click="$emit('filter', 'warning')">Warning ({{ counts.warning }})</button>
        <button class="gtm-pill ok" :class="{ 'is-active': activeSeverity === 'ok' }" @click="$emit('filter', 'ok')">OK ({{ counts.ok }})</button>
      </div>

      <div v-if="filteredFlags.length" class="gtm-masonry">
        <article v-for="(flag, idx) in filteredFlags" :key="`${flag.title}-${idx}`" class="gtm-flag-card" :class="flag.severity">
          <div class="flex items-start justify-between gap-3">
            <p class="font-medium text-sm gtm-text">{{ flag.title }}</p>
            <span class="gtm-badge" :class="flag.severity">{{ flag.severity }}</span>
          </div>
          <p class="mt-1 text-xs gtm-muted">{{ flag.desc }}</p>
        </article>
      </div>

      <div v-else class="rounded-lg border p-4 text-sm" style="border-color: var(--border-default); color: var(--color-text-muted)">
        No findings match this filter.
      </div>
    </div>

    <p v-if="updatedAt" class="text-xs gtm-muted">Last updated: {{ updatedAt }}</p>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import type { GTMFlag, GTMSummary } from '~/types/integrations'

const props = defineProps<{
  isAdmin: boolean
  loading: boolean
  connecting: boolean
  mappingSaving: boolean
  configured: boolean
  connected: boolean
  summary: GTMSummary | null
  services: { gtm: boolean; ga4: boolean; gsc: boolean }
  ids: { accountId: string; containerId: string; workspaceId: string; ga4PropertyId: string; gscSiteUrl: string }
  filteredFlags: GTMFlag[]
  activeSeverity: 'all' | 'critical' | 'warning' | 'ok'
  counts: { all: number; critical: number; warning: number; ok: number }
  updatedAt: string
  error: string
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'connect'): void
  (e: 'disconnect'): void
  (e: 'filter', severity: 'all' | 'critical' | 'warning' | 'ok'): void
  (e: 'save-mapping', ids: { accountId: string; containerId: string; workspaceId: string; ga4PropertyId: string; gscSiteUrl: string }): void
}>()
const draftIds = reactive({
  accountId: '',
  containerId: '',
  workspaceId: '',
  ga4PropertyId: '',
  gscSiteUrl: '',
})

watch(
  () => props.ids,
  (ids) => {
    draftIds.accountId = ids.accountId || ''
    draftIds.containerId = ids.containerId || ''
    draftIds.workspaceId = ids.workspaceId || ''
    draftIds.ga4PropertyId = ids.ga4PropertyId || ''
    draftIds.gscSiteUrl = ids.gscSiteUrl || ''
  },
  { immediate: true, deep: true }
)

const saveMapping = () => {
  emit('save-mapping', { ...draftIds })
}
</script>

<style scoped>
.gtm-text { color: var(--color-text); }
.gtm-muted { color: var(--color-text-muted); }
.gtm-metric-card { border: 1px solid var(--border-default); background: var(--color-bg); border-radius: var(--radius-lg); padding: var(--spacing-4); text-align: left; cursor: pointer; }
.gtm-metric-card.is-active { border-color: var(--color-brand-600); background: var(--color-brand-50); }
.gtm-pill { border: 1px solid var(--border-default); border-radius: 9999px; padding: var(--spacing-1) var(--spacing-3); font-size: 12px; color: var(--color-text-muted); background: var(--color-bg); }
.gtm-pill.is-active { color: var(--color-text); border-color: var(--color-brand-600); background: var(--color-brand-50); }
.gtm-pill.critical.is-active { color: var(--color-danger-700); border-color: var(--color-danger-700); background: var(--color-danger-100); }
.gtm-pill.warning.is-active { color: var(--color-brand-700); border-color: var(--color-brand-700); background: var(--color-brand-100); }
.gtm-pill.ok.is-active { color: var(--color-success-800); border-color: var(--color-success-800); background: var(--color-success-100); }
.gtm-masonry { column-count: 2; column-gap: var(--spacing-3); }
.gtm-flag-card { break-inside: avoid; margin-bottom: var(--spacing-3); border: 1px solid var(--border-default); border-left-width: 3px; border-radius: var(--radius-lg); background: var(--color-bg); padding: var(--spacing-3); }
.gtm-flag-card.critical { border-left-color: var(--color-danger-700); }
.gtm-flag-card.warning { border-left-color: var(--color-brand-700); }
.gtm-flag-card.ok { border-left-color: var(--color-success-800); }
.gtm-badge { font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; border-radius: 9999px; padding: 2px 8px; }
.gtm-badge.critical { color: var(--color-danger-700); background: var(--color-danger-100); }
.gtm-badge.warning { color: var(--color-brand-700); background: var(--color-brand-100); }
.gtm-badge.ok { color: var(--color-success-800); background: var(--color-success-100); }
@media (max-width: 640px) { .gtm-masonry { column-count: 1; } }
</style>
