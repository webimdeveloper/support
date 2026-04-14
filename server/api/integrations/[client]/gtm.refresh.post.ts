import { useSupabaseServer } from '../../../utils/supabase'
import { analyzeGTMContainer, fetchGTMContainer } from '../../../utils/gtm-audit'
import { resolveClientBySlug } from '../../../utils/client-resolver'
import { ok } from '../../../utils/api-envelope'
import { decryptToken } from '../../../utils/token-crypto'
import { requireAdmin } from '../../../utils/auth'
import { assertRateLimit } from '../../../utils/rate-limit'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
  assertRateLimit({
    key: `gtm-refresh:${ip}`,
    max: 30,
    windowMs: 60_000,
    message: 'Too many GTM refresh requests. Please try again in one minute.',
  })

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

  const refreshToken = clientRow.google_refresh_token_enc
    ? decryptToken(event, String(clientRow.google_refresh_token_enc))
    : undefined
  const { tags, triggers, variables } = await fetchGTMContainer(event, { accountId, containerId, workspaceId, refreshToken })
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

  return ok({
    configured: true,
    connected: Boolean(clientRow.google_refresh_token_enc || clientRow.google_token_connected_at),
    cached: {
      summary: audit.summary,
      flags: audit.flags,
      rawData: audit.rawData,
      aiAnalysis: clientRow.gtm_ai_analysis || '',
      updatedAt,
    },
    services: {
      gtm: true,
      ga4: Boolean(clientRow.ga4_property_id),
      gsc: Boolean(clientRow.gsc_site_url),
    },
  })
})
