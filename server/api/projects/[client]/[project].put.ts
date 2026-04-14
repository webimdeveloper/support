import { useSupabaseServer } from '../../../utils/supabase'
import { requireAdmin } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { client, project } = getRouterParams(event)
  const clientSlug = String(client)
  const projectSlug = String(project)
  const body = await readBody<{ payload?: any }>(event)

  if (!body?.payload) {
    throw createError({ statusCode: 400, statusMessage: 'Payload is required' })
  }

  const supabase = useSupabaseServer(event)
  const { error } = await supabase
    .from('project_dashboards')
    .upsert(
      {
        client_slug: clientSlug,
        project_slug: projectSlug,
        payload: body.payload,
      },
      { onConflict: 'client_slug,project_slug' }
    )

  if (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save project dashboard data',
    })
  }

  return { success: true }
})
