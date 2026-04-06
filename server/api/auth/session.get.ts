// GET /api/auth/session
// Returns the current user session

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    })
  }

  return { user: session.user }
})
