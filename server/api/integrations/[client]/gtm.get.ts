import { resolveClientBySlug } from '../../../utils/client-resolver'
import { ok } from '../../../utils/api-envelope'
import { requireClientScope } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  const { client } = getRouterParams(event)
  const clientSlug = String(client || '')
  const user = await requireClientScope(event, clientSlug)
  const isAdmin = user.role === 'admin'

  const data = await resolveClientBySlug(event, clientSlug)
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  const connected = Boolean(data.google_refresh_token_enc || data.google_token_connected_at)
  return ok({
    configured: Boolean(data.gtm_account_id && data.gtm_container_id && data.gtm_workspace_id),
    connected,
    ids: isAdmin
      ? {
          accountId: data.gtm_account_id || '',
          containerId: data.gtm_container_id || '',
          workspaceId: data.gtm_workspace_id || '',
          ga4PropertyId: data.ga4_property_id || '',
          gscSiteUrl: data.gsc_site_url || '',
        }
      : undefined,
    services: {
      gtm: Boolean(data.gtm_account_id && data.gtm_container_id && data.gtm_workspace_id),
      ga4: Boolean(data.ga4_property_id),
      gsc: Boolean(data.gsc_site_url),
    },
    cached: data.gtm_audit_data
      ? {
          summary: (data.gtm_audit_data as any).summary || null,
          flags: (data.gtm_audit_data as any).flags || [],
          rawData: (data.gtm_audit_data as any).rawData || null,
          aiAnalysis: data.gtm_ai_analysis || '',
          updatedAt: data.gtm_last_updated || null,
        }
      : null,
  })
})
