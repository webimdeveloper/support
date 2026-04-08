// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  srcDir: '.',
  ssr: false,
  devtools: { enabled: true },
  app: {
    head: {
      meta: [
        process.env.GOOGLE_SITE_VERIFICATION
          ? { name: 'google-site-verification', content: process.env.GOOGLE_SITE_VERIFICATION }
          : undefined,
      ].filter(Boolean) as any,
    },
  },

  css: ['~/assets/css/main.css'],

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'nuxt-auth-utils'
  ],

  runtimeConfig: {
    adminUser: process.env.ADMIN_USER,
    adminPassHash: process.env.ADMIN_PASS_HASH,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    googleTokenEncryptionKey: process.env.GOOGLE_TOKEN_ENCRYPTION_KEY,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
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
