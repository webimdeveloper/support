// middleware/auth.ts
// Redirect to login if no session exists

export default defineRouteMiddleware(async (to, from) => {
  if (to.path === '/') {
    return
  }

  const { data: session } = await useFetch('/api/auth/session')

  if (!session.value) {
    return navigateTo('/')
  }
})
