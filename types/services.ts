export type ServiceModuleId = 'cro' | 'site-health'

export type ServiceModuleStatus = 'available' | 'degraded' | 'disabled' | 'error'

export type ServiceModuleManifestItem = {
  id: ServiceModuleId
  label: string
  description: string
  status: ServiceModuleStatus
  enabled: boolean
  reason?: string
}

export type ServiceModuleManifestResponse = {
  modules: ServiceModuleManifestItem[]
}
