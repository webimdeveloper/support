import { useSupabaseServer } from '../../../../utils/supabase'
import { resolveClientBySlug } from '../../../../utils/client-resolver'
import { ok } from '../../../../utils/api-envelope'

type MappingBody = {
  gtmAccountId?: string
  gtmContainerId?: string
  gtmWorkspaceId?: string
  ga4PropertyId?: string
  gscSiteUrl?: string
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (session?.user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  const { client } = getRouterParams(event)
  const clientSlug = String(client || '')
  const body = await readBody<MappingBody>(event)

  const clientRow = await resolveClientBySlug(event, clientSlug)
  if (!clientRow) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  const updatePayload = {
    gtm_account_id: body.gtmAccountId?.trim() || null,
    gtm_container_id: body.gtmContainerId?.trim() || null,
    gtm_workspace_id: body.gtmWorkspaceId?.trim() || null,
    ga4_property_id: body.ga4PropertyId?.trim() || null,
    gsc_site_url: body.gscSiteUrl?.trim() || null,
  }

  const supabase = useSupabaseServer(event)
  const { data, error } = await supabase
    .from('clients')
    .update(updatePayload)
    .eq('id', clientRow.id)
    .select('slug, gtm_account_id, gtm_container_id, gtm_workspace_id, ga4_property_id, gsc_site_url')
    .single()

  if (error || !data) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update integration mapping' })
  }

  return ok({ mapping: data })
})
