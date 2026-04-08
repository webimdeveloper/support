import { resolveClientBySlug } from '../../../utils/client-resolver'
import { ok } from '../../../utils/api-envelope'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const user = session?.user as any
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const { client } = getRouterParams(event)
  const clientSlug = String(client || '')
  if (user.role !== 'admin' && user.slug !== clientSlug) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const clientRow = await resolveClientBySlug(event, clientSlug)
  if (!clientRow) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  return ok({
    configured: Boolean(clientRow.ga4_property_id),
    connected: Boolean(clientRow.google_refresh_token_enc || clientRow.google_token_connected_at),
    propertyId: clientRow.ga4_property_id || '',
    snapshot: clientRow.ga4_snapshot || null,
    updatedAt: clientRow.ga4_last_updated || null,
    error: clientRow.ga4_last_error || null,
  })
})
