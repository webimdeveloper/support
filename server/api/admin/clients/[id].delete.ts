// DELETE /api/admin/clients/[id]
// Delete a client

export default defineEventHandler(async (event) => {
  const { id } = getRouterParams(event)

  // TODO: Verify admin session
  // TODO: Delete from Supabase clients table
  // TODO: Return success message

  throw createError({
    statusCode: 404,
    statusMessage: 'Client not found',
  })
})
