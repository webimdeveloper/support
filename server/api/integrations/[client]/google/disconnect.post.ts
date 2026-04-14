import { useSupabaseServer } from '../../../../utils/supabase'
import { resolveClientBySlug } from '../../../../utils/client-resolver'
import { ok } from '../../../../utils/api-envelope'
import { requireClientScope } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const { client } = getRouterParams(event)
  const clientSlug = String(client || '')
  const user = await requireClientScope(event, clientSlug)
  const isAdmin = user.role === 'admin'

  const clientRow = await resolveClientBySlug(event, clientSlug)
  if (!clientRow) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  const supabase = useSupabaseServer(event)
  const { error } = await supabase
    .from('clients')
    .update({
      google_refresh_token_enc: null,
      google_token_connected_at: null,
      google_token_connected_email: null,
      google_token_scopes: null,
      google_token_last_error: null,
      google_services_state: {},
    })
    .eq('id', clientRow.id)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to disconnect Google account' })
  }

  return ok({ disconnected: true })
})
