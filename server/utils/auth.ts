type SessionUserRole = 'admin' | 'client'

export type SessionUser = {
  id?: string
  slug: string
  role: SessionUserRole
}

export const getSessionUser = async (event: any): Promise<SessionUser> => {
  const session = await getUserSession(event)
  const user = session?.user as SessionUser | undefined

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  return user
}

export const requireAdmin = async (event: any): Promise<SessionUser> => {
  const user = await getSessionUser(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  return user
}

export const requireClientScope = async (event: any, clientSlug: string): Promise<SessionUser> => {
  const user = await getSessionUser(event)
  if (user.role === 'client' && user.slug !== clientSlug) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }
  return user
}
