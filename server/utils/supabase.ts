import { createClient } from '@supabase/supabase-js'

export const useSupabaseServer = (event?: any) => {
  const config = useRuntimeConfig(event)

  return createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey,
    {
      auth: {
        persistSession: false,
      },
    }
  )
}
