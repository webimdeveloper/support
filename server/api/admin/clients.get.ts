import { useSupabaseServer } from '../../utils/supabase'
import { requireAdmin } from '../../utils/auth'
import { deriveClientServiceStatuses } from '../../utils/client-services'

// GET /api/admin/clients
// List all clients for admin table
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const supabase = useSupabaseServer(event)
  const { data, error } = await supabase
    .from('clients')
    .select('id, slug, site_name, site_url, active, created_at, gtm_account_id, gtm_container_id, gtm_workspace_id, ga4_property_id, gsc_site_url, google_refresh_token_enc, google_token_connected_at, google_services_state')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load clients',
    })
  }

  return (data ?? []).map((client) => ({
    ...client,
    services: deriveClientServiceStatuses(client as any),
  }))
})
