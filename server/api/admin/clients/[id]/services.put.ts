import { useSupabaseServer } from '../../../../utils/supabase'
import { requireAdmin } from '../../../../utils/auth'
import { normalizeServiceManagementMode, type ServiceKey } from '../../../../utils/client-services'

type UpdateServiceModeBody = {
  service?: ServiceKey
  managementMode?: 'admin_managed' | 'client_self_service'
}

const isServiceKey = (value: unknown): value is ServiceKey =>
  value === 'gtm' || value === 'ga4' || value === 'gsc'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = getRouterParams(event)
  const body = await readBody<UpdateServiceModeBody>(event)

  if (!isServiceKey(body.service)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid service key' })
  }

  const managementMode = normalizeServiceManagementMode(body.managementMode)
  const supabase = useSupabaseServer(event)

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('id, google_services_state')
    .eq('id', id)
    .maybeSingle()

  if (clientError || !client) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  const existingState = (client.google_services_state as any) || {}
  const existingModes = existingState.managementModes || {}
  const googleServicesState = {
    ...existingState,
    managementModes: {
      ...existingModes,
      [body.service]: managementMode,
    },
  }

  const { error: updateError } = await supabase
    .from('clients')
    .update({ google_services_state: googleServicesState })
    .eq('id', id)

  if (updateError) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to update service management mode' })
  }

  return {
    success: true,
    service: body.service,
    managementMode,
  }
})
