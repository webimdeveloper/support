export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/') return

  try {
    await $fetch('/api/auth/session')
  } catch {
    return navigateTo('/')
  }
})
