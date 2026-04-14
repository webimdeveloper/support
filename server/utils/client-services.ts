export type ServiceKey = 'gtm' | 'ga4' | 'gsc'
export type ServiceManagementMode = 'admin_managed' | 'client_self_service'

export type ClientServiceStatus = {
  key: ServiceKey
  configured: boolean
  connected: boolean
  managementMode: ServiceManagementMode
}

type ClientIntegrationRow = {
  gtm_account_id?: string | null
  gtm_container_id?: string | null
  gtm_workspace_id?: string | null
  ga4_property_id?: string | null
  gsc_site_url?: string | null
  google_refresh_token_enc?: string | null
  google_token_connected_at?: string | null
  google_services_state?: any
}

const defaultManagementMode: ServiceManagementMode = 'client_self_service'

export const normalizeServiceManagementMode = (value: unknown): ServiceManagementMode => {
  if (value === 'admin_managed') return 'admin_managed'
  return defaultManagementMode
}

export const deriveClientServiceStatuses = (client: ClientIntegrationRow): ClientServiceStatus[] => {
  const managementModes = (client.google_services_state as any)?.managementModes || {}
  const connected = Boolean(client.google_refresh_token_enc || client.google_token_connected_at)

  return [
    {
      key: 'gtm',
      configured: Boolean(client.gtm_account_id && client.gtm_container_id && client.gtm_workspace_id),
      connected,
      managementMode: normalizeServiceManagementMode(managementModes.gtm),
    },
    {
      key: 'ga4',
      configured: Boolean(client.ga4_property_id),
      connected,
      managementMode: normalizeServiceManagementMode(managementModes.ga4),
    },
    {
      key: 'gsc',
      configured: Boolean(client.gsc_site_url),
      connected,
      managementMode: normalizeServiceManagementMode(managementModes.gsc),
    },
  ]
}
