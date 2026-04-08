import { useSupabaseServer } from '../../../utils/supabase'
import { analyzeGTMContainer, fetchGTMContainer } from '../../../utils/gtm-audit'
import { resolveClientBySlug } from '../../../utils/client-resolver'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (session?.user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }

  const { client } = getRouterParams(event)
  const clientSlug = String(client || '')
  const supabase = useSupabaseServer(event)
  const clientRow = await resolveClientBySlug(event, clientSlug)
  if (!clientRow) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  const accountId = String(clientRow.gtm_account_id || '')
  const containerId = String(clientRow.gtm_container_id || '')
  const workspaceId = String(clientRow.gtm_workspace_id || '')
  if (!accountId || !containerId || !workspaceId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'GTM is not configured for this client',
    })
  }

  const { tags, triggers, variables } = await fetchGTMContainer(event, { accountId, containerId, workspaceId })
  const audit = analyzeGTMContainer(tags, triggers, variables)
  const updatedAt = new Date().toISOString()

  const { error: saveError } = await supabase
    .from('clients')
    .update({
      gtm_audit_data: audit,
      gtm_last_updated: updatedAt,
    })
    .eq('id', clientRow.id)

  if (saveError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to cache GTM audit result' })
  }

  return {
    connected: true,
    summary: audit.summary,
    flags: audit.flags,
    rawData: audit.rawData,
    updatedAt,
  }
})
