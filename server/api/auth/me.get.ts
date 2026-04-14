import { useSupabaseServer } from '../../utils/supabase'
import { getProjectSlugFromUrl } from '../../utils/project'
import { getSessionUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)

  if (user.role === 'admin') {
    return {
      user,
      defaultProjectSlug: null,
    }
  }

  const supabase = useSupabaseServer(event)
  const { data: client, error } = await supabase
    .from('clients')
    .select('site_url')
    .eq('slug', user.slug)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load client profile' })
  }

  return {
    user,
    defaultProjectSlug: getProjectSlugFromUrl(client?.site_url || user.slug),
  }
})
