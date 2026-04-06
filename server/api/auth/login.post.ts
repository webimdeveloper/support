// POST /api/auth/login
// Handles login for both admin and clients

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { slug, password } = body

  if (!slug || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug and password are required',
    })
  }

  // TODO: Implement rate limiting (10 requests per minute per IP)
  // TODO: Check if admin login
  // TODO: Check Supabase clients table for client login
  // TODO: Compare password with bcrypt
  // TODO: Set user session with setUserSession()

  throw createError({
    statusCode: 401,
    statusMessage: 'Invalid credentials',
  })
})
