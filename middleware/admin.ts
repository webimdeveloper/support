export default defineNuxtRouteMiddleware(async () => {
  try {
    const session = await $fetch('/api/auth/session')
    if ((session as any)?.user?.role !== 'admin') {
      return navigateTo('/')
    }
  } catch {
    return navigateTo('/')
  }
})
