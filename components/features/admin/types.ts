export type ClientStatus = 'Active' | 'New' | 'Closed'

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
}
