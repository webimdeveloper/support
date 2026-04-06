// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: '.',
  ssr: false,
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },

  modules: [
    '@pinia/nuxt',
    'nuxt-auth-utils'
  ],

  runtimeConfig: {
    adminUser: process.env.ADMIN_USER,
    adminPassHash: process.env.ADMIN_PASS_HASH,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
      cookie: {
        secure: process.env.NODE_ENV === 'production',
      }
    },
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    }
  }
})
