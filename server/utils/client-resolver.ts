import { useSupabaseServer } from './supabase'

const normalizeSlug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

export const resolveClientBySlug = async (event: any, slugParam: string) => {
  const supabase = useSupabaseServer(event)
  const slug = String(slugParam || '').trim().toLowerCase()

  if (!slug) return null

  const direct = await supabase
    .from('clients')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (direct.error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load client' })
  }
  if (direct.data) return direct.data

  // Fallback for historical slug variants (e.g. dayodental vs dayo-dental)
  const { data: candidates, error } = await supabase
    .from('clients')
    .select('*')
    .limit(200)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load clients' })
  }

  const target = normalizeSlug(slug)
  return (candidates || []).find((item) => normalizeSlug(String(item.slug || '')) === target) || null
}
