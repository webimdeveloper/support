// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    'nuxt-auth-utils'
  ],

  css: [
    './assets/css/main.css'
  ],

  runtimeConfig: {
    adminUser: process.env.ADMIN_USER,
    adminPassHash: process.env.ADMIN_PASS_HASH,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  }
})
