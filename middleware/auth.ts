export default defineNuxtRouteMiddleware(async () => {
  try {
    await $fetch('/api/auth/session')
  } catch {
    return navigateTo('/login')
  }
})
