// PUT /api/admin/clients/[id]
// Update a client

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  // TODO: Verify admin session
  // TODO: Validate input
  // TODO: Hash password with bcrypt cost 12 if password is provided
  // TODO: Update Supabase clients table
  // TODO: Return updated client

  throw createError({
    statusCode: 404,
    statusMessage: 'Client not found',
  })
})
