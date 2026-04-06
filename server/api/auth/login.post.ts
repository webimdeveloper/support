import bcrypt from 'bcrypt'
import { useSupabaseServer } from '../../utils/supabase'

const loginAttempts = new Map<string, { count: number; resetTime: number }>()

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body = await readBody(event)
  const { slug, password } = body

  if (!slug || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug and password are required',
    })
  }

  // Rate limiting: 10 requests per minute per IP
  const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
  const now = Date.now()
  const attempt = loginAttempts.get(ip)

  if (attempt && now < attempt.resetTime) {
    if (attempt.count >= 10) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many login attempts. Please try again later.',
      })
    }
    attempt.count++
  } else {
    loginAttempts.set(ip, { count: 1, resetTime: now + 60000 }) // 1 minute window
  }

  // Check admin login
  if (slug === config.adminUser) {
    const passwordMatch = await bcrypt.compare(password, config.adminPassHash)

    if (passwordMatch) {
      await setUserSession(event, {
        user: {
          slug: config.adminUser,
          role: 'admin',
        },
      })

      return {
        success: true,
        user: {
          slug: config.adminUser,
          role: 'admin',
        },
      }
    }

    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  // Check client login in Supabase
  const supabase = useSupabaseServer(event)

  const { data: client, error } = await supabase
    .from('clients')
    .select('id, slug, pass_hash, active')
    .eq('slug', slug)
    .single()

  if (error || !client) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  if (!client.active) {
    throw createError({
      statusCode: 403,
      statusMessage: 'This account is inactive',
    })
  }

  const passwordMatch = await bcrypt.compare(password, client.pass_hash)

  if (!passwordMatch) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  // Set session
  await setUserSession(event, {
    user: {
      id: client.id,
      slug: client.slug,
      role: 'client',
    },
  })

  return {
    success: true,
    user: {
      id: client.id,
      slug: client.slug,
      role: 'client',
    },
  }
})
