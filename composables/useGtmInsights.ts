import type { GTMFlag, GTMStatusData, GTMSummary, IntegrationEnvelope } from '~/types/integrations'

export const useGtmInsights = (clientSlug: Ref<string>, isAdmin: Ref<boolean>) => {
  const configured = ref(false)
  const connected = ref(false)
  const summary = ref<GTMSummary | null>(null)
  const flags = ref<GTMFlag[]>([])
  const services = ref({ gtm: false, ga4: false, gsc: false })
  const ids = ref({ accountId: '', containerId: '', workspaceId: '', ga4PropertyId: '', gscSiteUrl: '' })
  const updatedAt = ref('')
  const loading = ref(false)
  const connecting = ref(false)
  const mappingSaving = ref(false)
  const error = ref('')
  const activeSeverity = ref<'all' | 'critical' | 'warning' | 'ok'>('all')

  const severityCounts = computed(() => {
    const critical = flags.value.filter((f) => f.severity === 'critical').length
    const warning = flags.value.filter((f) => f.severity === 'warning').length
    const ok = flags.value.filter((f) => f.severity === 'ok').length
    return { all: flags.value.length, critical, warning, ok }
  })

  const filteredFlags = computed(() => {
    if (activeSeverity.value === 'all') return flags.value
    return flags.value.filter((f) => f.severity === activeSeverity.value)
  })

  const setSeverityFilter = (severity: 'all' | 'critical' | 'warning' | 'ok') => {
    activeSeverity.value = severity
  }

  const load = async () => {
    error.value = ''
    try {
      const res = await $fetch<IntegrationEnvelope<GTMStatusData>>(`/api/integrations/${clientSlug.value}/gtm`)
      if (!res.success || !res.data) {
        error.value = res.error?.message || 'Failed to load GTM insights'
        return
      }
      configured.value = res.data.configured
      connected.value = res.data.connected
      services.value = res.data.services || { gtm: false, ga4: false, gsc: false }
      ids.value = {
        accountId: res.data.ids?.accountId || '',
        containerId: res.data.ids?.containerId || '',
        workspaceId: res.data.ids?.workspaceId || '',
        ga4PropertyId: res.data.ids?.ga4PropertyId || '',
        gscSiteUrl: res.data.ids?.gscSiteUrl || '',
      }
      summary.value = res.data.cached?.summary || null
      flags.value = res.data.cached?.flags || []
      updatedAt.value = res.data.cached?.updatedAt || ''
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'Failed to load GTM insights'
    }
  }

  const refresh = async () => {
    if (!isAdmin.value) return
    loading.value = true
    error.value = ''
    try {
      const res = await $fetch<IntegrationEnvelope<GTMStatusData>>(`/api/integrations/${clientSlug.value}/gtm.refresh`, { method: 'POST' })
      if (!res.success || !res.data) {
        error.value = res.error?.message || 'Failed to update GTM insights'
        return
      }
      configured.value = res.data.configured
      connected.value = res.data.connected
      services.value = res.data.services || services.value
      summary.value = res.data.cached?.summary || null
      flags.value = res.data.cached?.flags || []
      updatedAt.value = res.data.cached?.updatedAt || ''
    } finally {
      loading.value = false
    }
  }

  const connect = async (service: 'gtm' | 'ga4' | 'gsc' | 'all' = 'all') => {
    connecting.value = true
    error.value = ''
    try {
      const res = await $fetch<IntegrationEnvelope<{ connectUrl: string }>>(`/api/integrations/${clientSlug.value}/google/connect-url`, {
        query: { service },
      })
      if (!res.success || !res.data?.connectUrl) {
        error.value = res.error?.message || 'Failed to prepare Google connect URL'
        return
      }
      window.location.href = res.data.connectUrl
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'Failed to connect Google account'
    } finally {
      connecting.value = false
    }
  }

  const disconnect = async () => {
    loading.value = true
    error.value = ''
    try {
      await $fetch(`/api/integrations/${clientSlug.value}/google/disconnect`, { method: 'POST' })
      connected.value = false
      summary.value = null
      flags.value = []
      updatedAt.value = ''
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'Failed to disconnect Google account'
    } finally {
      loading.value = false
    }
  }

  const saveMapping = async () => {
    if (!isAdmin.value) return
    mappingSaving.value = true
    error.value = ''
    try {
      await $fetch(`/api/integrations/${clientSlug.value}/google/mapping`, {
        method: 'PUT',
        body: {
          gtmAccountId: ids.value.accountId,
          gtmContainerId: ids.value.containerId,
          gtmWorkspaceId: ids.value.workspaceId,
          ga4PropertyId: ids.value.ga4PropertyId,
          gscSiteUrl: ids.value.gscSiteUrl,
        },
      })
      configured.value = Boolean(ids.value.accountId && ids.value.containerId && ids.value.workspaceId)
      services.value = {
        gtm: configured.value,
        ga4: Boolean(ids.value.ga4PropertyId),
        gsc: Boolean(ids.value.gscSiteUrl),
      }
    } catch (e: any) {
      error.value = e?.data?.statusMessage || 'Failed to save integration mapping'
    } finally {
      mappingSaving.value = false
    }
  }

  return {
    configured,
    connected,
    summary,
    flags,
    services,
    ids,
    updatedAt,
    loading,
    connecting,
    mappingSaving,
    error,
    activeSeverity,
    severityCounts,
    filteredFlags,
    setSeverityFilter,
    load,
    refresh,
    connect,
    disconnect,
    saveMapping,
  }
}
