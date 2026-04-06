// middleware/admin.ts
// Redirect to login if not admin

export default defineRouteMiddleware(async (to, from) => {
  const { data: session } = await useFetch('/api/auth/session')

  if (!session.value || session.value.user?.role !== 'admin') {
    return navigateTo('/')
  }
})
