import type { ClientServiceStatus } from '../../utils/client-services'
import type { ServiceModuleManifestItem } from '../../../types/services'

export type ServiceModuleContext = {
  clientSlug: string
  serviceStatuses: ClientServiceStatus[]
}

export type ServiceModuleProvider = {
  id: ServiceModuleManifestItem['id']
  buildManifestItem: (context: ServiceModuleContext) => Promise<ServiceModuleManifestItem> | ServiceModuleManifestItem
}
