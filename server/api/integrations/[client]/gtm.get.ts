import { useSupabaseServer } from '../../../utils/supabase'

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

  const supabase = useSupabaseServer(event)
  const { data, error } = await supabase
    .from('clients')
    .select('slug, site_name, gtm_account_id, gtm_container_id, gtm_workspace_id, gtm_audit_data, gtm_ai_analysis, gtm_last_updated')
    .eq('slug', clientSlug)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load GTM integration data' })
  }
  if (!data) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  return {
    configured: Boolean(data.gtm_account_id && data.gtm_container_id && data.gtm_workspace_id),
    ids: isAdmin
      ? {
          accountId: data.gtm_account_id || '',
          containerId: data.gtm_container_id || '',
          workspaceId: data.gtm_workspace_id || '',
        }
      : undefined,
    cached: data.gtm_audit_data
      ? {
          summary: (data.gtm_audit_data as any).summary || null,
          flags: (data.gtm_audit_data as any).flags || [],
          rawData: (data.gtm_audit_data as any).rawData || null,
          aiAnalysis: data.gtm_ai_analysis || '',
          updatedAt: data.gtm_last_updated || null,
        }
      : null,
  }
})
