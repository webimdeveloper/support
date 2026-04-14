import { useSupabaseServer } from '../../utils/supabase'
import { requireAdmin } from '../../utils/auth'

// GET /api/admin/clients
// List all clients for admin table
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const supabase = useSupabaseServer(event)
  const { data, error } = await supabase
    .from('clients')
    .select('id, slug, site_name, site_url, active, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to load clients',
    })
  }

  return data ?? []
})
