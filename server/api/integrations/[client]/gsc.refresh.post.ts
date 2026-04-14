import { useSupabaseServer } from '../../../utils/supabase'
import { resolveClientBySlug } from '../../../utils/client-resolver'
import { decryptToken } from '../../../utils/token-crypto'
import { fetchGSCSnapshot } from '../../../utils/google-service-data'
import { ok } from '../../../utils/api-envelope'
import { requireAdmin } from '../../../utils/auth'
import { assertRateLimit } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
  assertRateLimit({
    key: `gsc-refresh:${ip}`,
    max: 30,
    windowMs: 60_000,
    message: 'Too many Search Console refresh requests. Please try again in one minute.',
  })
  const { client } = getRouterParams(event)
  const clientSlug = String(client || '')
  const clientRow = await resolveClientBySlug(event, clientSlug)
  if (!clientRow) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }
  if (!clientRow.gsc_site_url) {
    throw createError({ statusCode: 400, statusMessage: 'Search Console site URL is not configured for this client' })
  }
  const refreshToken = clientRow.google_refresh_token_enc ? decryptToken(event, String(clientRow.google_refresh_token_enc)) : undefined
  const snapshot = await fetchGSCSnapshot(event, String(clientRow.gsc_site_url), refreshToken)
  const updatedAt = new Date().toISOString()

  const supabase = useSupabaseServer(event)
  const { error } = await supabase
    .from('clients')
    .update({ gsc_snapshot: snapshot, gsc_last_updated: updatedAt, gsc_last_error: null })
    .eq('id', clientRow.id)
  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to save Search Console snapshot' })
  }
  return ok({ configured: true, connected: Boolean(refreshToken), snapshot, updatedAt })
})
