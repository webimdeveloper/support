import { ok } from '../../../../../utils/api-envelope'
import { buildSignedState, getScopesForService } from '../../../../../utils/google-oauth'
import { resolveClientBySlug } from '../../../../../utils/client-resolver'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const user = session?.user as any
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const { client } = getRouterParams(event)
  const clientSlug = String(client || '')
  const isAdmin = user.role === 'admin'
  if (!isAdmin && user.slug !== clientSlug) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const clientRow = await resolveClientBySlug(event, clientSlug)
  if (!clientRow) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  const service = (getQuery(event).service as string || 'gtm') as 'gtm' | 'ga4' | 'gsc' | 'all'
  const scopes = getScopesForService(service)
  const origin = getRequestURL(event).origin
  const redirectUri = `${origin}/api/integrations/google/callback`
  const state = buildSignedState(event, {
    clientSlug: String(clientRow.slug),
    service,
    requestedBy: String(user.slug || ''),
    role: String(user.role || ''),
  })

  const config = useRuntimeConfig(event)
  const params = new URLSearchParams({
    client_id: String(config.googleClientId || ''),
    redirect_uri: redirectUri,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    scope: scopes.join(' '),
    state,
  })

  return ok({
    connectUrl: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    service,
  })
})
