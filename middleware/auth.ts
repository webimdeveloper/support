export default defineNuxtRouteMiddleware(async (to) => {
  if (['/', '/login', '/privacy', '/terms', '/contact', '/about'].includes(to.path)) return

  try {
    await $fetch('/api/auth/session')
  } catch {
    return navigateTo('/login')
  }
})
