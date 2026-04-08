import { useSupabaseServer } from '../../../utils/supabase'
import { resolveClientBySlug } from '../../../utils/client-resolver'
import { decryptToken } from '../../../utils/token-crypto'
import { fetchGA4Snapshot } from '../../../utils/google-service-data'
import { ok } from '../../../utils/api-envelope'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (session?.user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  const { client } = getRouterParams(event)
  const clientSlug = String(client || '')
  const clientRow = await resolveClientBySlug(event, clientSlug)
  if (!clientRow) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }
  if (!clientRow.ga4_property_id) {
    throw createError({ statusCode: 400, statusMessage: 'GA4 property is not configured for this client' })
  }
  const refreshToken = clientRow.google_refresh_token_enc ? decryptToken(event, String(clientRow.google_refresh_token_enc)) : undefined
  const snapshot = await fetchGA4Snapshot(event, String(clientRow.ga4_property_id), refreshToken)
  const updatedAt = new Date().toISOString()

  const supabase = useSupabaseServer(event)
  const { error } = await supabase
    .from('clients')
    .update({ ga4_snapshot: snapshot, ga4_last_updated: updatedAt, ga4_last_error: null })
    .eq('id', clientRow.id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to save GA4 snapshot' })
  }
  return ok({ configured: true, connected: Boolean(refreshToken), snapshot, updatedAt })
})
