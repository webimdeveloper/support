import bcrypt from 'bcrypt'
import { useSupabaseServer } from '../../utils/supabase'

type SaveProjectBody = {
  clientName?: string
  siteUrl?: string
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (session?.user?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Admin access required',
    })
  }

  const body = await readBody<SaveProjectBody>(event)
  const clientName = body.clientName?.trim()
  const siteUrl = body.siteUrl?.trim()

  if (!clientName || !siteUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Client and project URL are required',
    })
  }

  let normalizedUrl: string
  try {
    normalizedUrl = new URL(siteUrl).toString()
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid project URL',
    })
  }

  const slug = slugify(clientName)
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid client name',
    })
  }

  const supabase = useSupabaseServer(event)
  const { data: existingClient, error: existingError } = await supabase
    .from('clients')
    .select('id, slug, site_name, site_url, active, created_at')
    .eq('slug', slug)
    .maybeSingle()

  if (existingError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to check existing client',
    })
  }

  if (existingClient?.site_url === normalizedUrl) {
    throw createError({
      statusCode: 409,
      statusMessage: 'This project URL already exists for this client',
    })
  }

  if (existingClient) {
    const { data: updatedClient, error: updateError } = await supabase
      .from('clients')
      .update({
        site_url: normalizedUrl,
        site_name: clientName,
      })
      .eq('id', existingClient.id)
      .select('id, slug, site_name, site_url, active, created_at')
      .single()

    if (updateError || !updatedClient) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to save project URL',
      })
    }

    return { client: updatedClient, action: 'updated' as const }
  }

  const generatedPassword = crypto.randomUUID()
  const passHash = await bcrypt.hash(generatedPassword, 12)

  const { data: createdClient, error: createErrorResult } = await supabase
    .from('clients')
    .insert({
      slug,
      site_name: clientName,
      site_url: normalizedUrl,
      pass_hash: passHash,
      active: true,
    })
    .select('id, slug, site_name, site_url, active, created_at')
    .single()

  if (createErrorResult || !createdClient) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create client project',
    })
  }

  return { client: createdClient, action: 'created' as const }
})
