import type { ServiceModuleProvider } from '../types'

const serviceTitle = (key: string) => {
  if (key === 'gtm') return 'GTM'
  if (key === 'ga4') return 'GA4'
  if (key === 'gsc') return 'Search Console'
  return key
}

export const siteHealthModuleProvider: ServiceModuleProvider = {
  id: 'site-health',
  buildManifestItem: async ({ serviceStatuses }) => {
    const missingAdminManaged = serviceStatuses
      .filter((item) => item.managementMode === 'admin_managed' && !item.configured)
      .map((item) => serviceTitle(item.key))

    if (missingAdminManaged.length > 0) {
      return {
        id: 'site-health',
        label: 'Site Health',
        description: 'GTM/GA4/GSC diagnostics and mapping.',
        status: 'disabled',
        enabled: false,
        reason: `Missing admin-managed setup for: ${missingAdminManaged.join(', ')}`,
      }
    }

    const hasConfigured = serviceStatuses.some((item) => item.configured)
    const hasConnected = serviceStatuses.some((item) => item.connected)

    if (!hasConfigured) {
      return {
        id: 'site-health',
        label: 'Site Health',
        description: 'GTM/GA4/GSC diagnostics and mapping.',
        status: 'degraded',
        enabled: true,
        reason: 'No services configured yet.',
      }
    }

    if (!hasConnected) {
      return {
        id: 'site-health',
        label: 'Site Health',
        description: 'GTM/GA4/GSC diagnostics and mapping.',
        status: 'degraded',
        enabled: true,
        reason: 'Configured, but no provider account connected yet.',
      }
    }

    return {
      id: 'site-health',
      label: 'Site Health',
      description: 'GTM/GA4/GSC diagnostics and mapping.',
      status: 'available',
      enabled: true,
    }
  },
}
