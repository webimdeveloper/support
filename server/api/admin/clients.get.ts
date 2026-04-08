import { useSupabaseServer } from '../../utils/supabase'

// GET /api/admin/clients
// List all clients for admin table
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (session?.user?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

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
