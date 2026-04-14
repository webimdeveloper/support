import { getSessionUser } from '../../utils/auth'

// GET /api/auth/session
// Returns the current user session
export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  return { user }
})
