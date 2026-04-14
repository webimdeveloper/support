export type ClientStatus = 'Active' | 'New' | 'Closed'

export type ServiceKey = 'gtm' | 'ga4' | 'gsc'
export type ServiceManagementMode = 'admin_managed' | 'client_self_service'
export type ClientServiceStatus = {
  key: ServiceKey
  configured: boolean
  connected: boolean
  managementMode: ServiceManagementMode
}

export type ClientRow = {
  id: string
  selected: boolean
  name: string
  slug: string
  siteUrl: string
  status: ClientStatus
  createdAt: string
  isClientEditing: boolean
  isProjectEditing: boolean
  clientInput: string
  projectInput: string
  services: ClientServiceStatus[]
}
