import { useSupabaseServer } from '../../../utils/supabase'
import { resolveClientBySlug } from '../../../utils/client-resolver'
import { encryptToken } from '../../../utils/token-crypto'
import { exchangeGoogleCode, verifySignedState } from '../../../utils/google-oauth'
import { getProjectSlugFromUrl } from '../../../utils/project'

const decodeJwtPayload = (token?: string) => {
  if (!token) return null
  try {
    const payload = token.split('.')[1]
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const code = String(query.code || '')
  const state = String(query.state || '')
  if (!code || !state) {
    throw createError({ statusCode: 400, statusMessage: 'Missing OAuth callback parameters' })
  }

  const parsedState = verifySignedState(event, state)
  if (!parsedState?.clientSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid OAuth state' })
  }

  const clientRow = await resolveClientBySlug(event, parsedState.clientSlug)
  if (!clientRow) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  const origin = getRequestURL(event).origin
  const redirectUri = `${origin}/api/integrations/google/callback`
  const tokenData = await exchangeGoogleCode(event, code, redirectUri)
  const refreshToken = String(tokenData.refresh_token || '')

  const idTokenPayload = decodeJwtPayload(tokenData.id_token)
  const connectedEmail = String(idTokenPayload?.email || '')
  const scopes = String(tokenData.scope || '').split(' ').filter(Boolean)
  const now = new Date().toISOString()

  const supabase = useSupabaseServer(event)
  const nextServicesState = {
    ...(clientRow.google_services_state || {}),
    [String(parsedState.service || 'gtm')]: true,
  }
  const { error } = await supabase
    .from('clients')
    .update({
      google_refresh_token_enc: refreshToken ? encryptToken(event, refreshToken) : clientRow.google_refresh_token_enc,
      google_token_connected_at: now,
      google_token_connected_email: connectedEmail || clientRow.google_token_connected_email,
      google_token_scopes: scopes.length > 0 ? scopes : clientRow.google_token_scopes,
      google_token_last_error: null,
      google_services_state: nextServicesState,
    })
    .eq('id', clientRow.id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to save Google connection' })
  }

  const projectSlug = getProjectSlugFromUrl(clientRow.site_url || clientRow.slug)
  return sendRedirect(event, `/${clientRow.slug}/${projectSlug}`)
})
