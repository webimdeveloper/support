import type { ServiceModuleProvider } from '../types'

export const croModuleProvider: ServiceModuleProvider = {
  id: 'cro',
  buildManifestItem: async () => ({
    id: 'cro',
    label: 'CRO',
    description: 'Conversion optimization workspace and content strategy.',
    status: 'available',
    enabled: true,
  }),
}
