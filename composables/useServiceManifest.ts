import type { IntegrationEnvelope } from '~/types/integrations'
import type { ServiceModuleManifestItem, ServiceModuleManifestResponse } from '~/types/services'

export const useServiceManifest = (clientSlug: Ref<string>) => {
  const modules = ref<ServiceModuleManifestItem[]>([])
  const loading = ref(false)
  const error = ref('')

  const load = async () => {
    loading.value = true
    error.value = ''
    try {
      const response = await $fetch<IntegrationEnvelope<ServiceModuleManifestResponse>>(
        `/api/services/${clientSlug.value}/manifest`
      )
      if (!response.success || !response.data) {
        error.value = response.error?.message || 'Failed to load service manifest'
        modules.value = []
        return
      }
      modules.value = response.data.modules || []
    } catch (err: any) {
      error.value = err?.data?.statusMessage || 'Failed to load service manifest'
      modules.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    modules,
    loading,
    error,
    load,
  }
}
