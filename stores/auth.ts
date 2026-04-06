import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    isAuthenticated: false,
    role: null as string | null,
  }),

  getters: {
    isAdmin: (state) => state.role === 'admin',
    isClient: (state) => state.role === 'client',
  },

  actions: {
    async login(slug: string, password: string) {
      try {
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: { slug, password },
        })

        this.user = response.user
        this.isAuthenticated = true
        this.role = response.user?.role || 'client'

        return response
      } catch (error) {
        this.isAuthenticated = false
        throw error
      }
    },

    async logout() {
      await $fetch('/api/auth/logout', { method: 'POST' })
      this.user = null
      this.isAuthenticated = false
      this.role = null
    },

    resetAuth() {
      this.user = null
      this.isAuthenticated = false
      this.role = null
    },
  },
})
