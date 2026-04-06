// POST /api/admin/clients
// Create a new client

export default defineEventHandler(async (event) => {
  // TODO: Verify admin session
  // TODO: Validate input (slug, site_name, site_url, password)
  // TODO: Hash password with bcrypt cost 12
  // TODO: Save to Supabase clients table
  // TODO: Return created client

  throw createError({
    statusCode: 400,
    statusMessage: 'Missing required fields',
  })
})
