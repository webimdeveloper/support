import { describe, expect, it } from 'vitest'
import { deriveClientServiceStatuses } from '../../server/utils/client-services'

describe('deriveClientServiceStatuses', () => {
  it('derives configured and management mode from client row', () => {
    const services = deriveClientServiceStatuses({
      gtm_account_id: '123',
      gtm_container_id: '456',
      gtm_workspace_id: '789',
      ga4_property_id: null,
      gsc_site_url: 'https://example.com',
      google_refresh_token_enc: 'encrypted-token',
      google_services_state: {
        managementModes: {
          gtm: 'admin_managed',
          gsc: 'client_self_service',
        },
      },
    })

    expect(services.find((item) => item.key === 'gtm')).toMatchObject({
      configured: true,
      connected: true,
      managementMode: 'admin_managed',
    })
    expect(services.find((item) => item.key === 'ga4')).toMatchObject({
      configured: false,
      managementMode: 'client_self_service',
    })
    expect(services.find((item) => item.key === 'gsc')).toMatchObject({
      configured: true,
      managementMode: 'client_self_service',
    })
  })
})
