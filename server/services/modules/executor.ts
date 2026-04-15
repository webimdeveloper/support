import type { ServiceModuleManifestItem } from '../../../types/services'
import { serviceModuleRegistry } from './registry'
import type { ServiceModuleContext } from './types'

export const buildServiceManifest = async (context: ServiceModuleContext): Promise<ServiceModuleManifestItem[]> => {
  const results = await Promise.all(
    serviceModuleRegistry.map(async (provider) => {
      try {
        return await provider.buildManifestItem(context)
      } catch (error: any) {
        return {
          id: provider.id,
          label: provider.id === 'site-health' ? 'Site Health' : 'CRO',
          description: 'Temporarily unavailable due to a module error.',
          status: 'error' as const,
          enabled: false,
          reason: error?.message || 'Module failed during manifest build.',
        }
      }
    })
  )

  return results
}
