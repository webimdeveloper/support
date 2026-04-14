const buckets = new Map<string, { count: number; resetAt: number }>()

type RateLimitOptions = {
  key: string
  max: number
  windowMs: number
  message?: string
}

export const assertRateLimit = ({ key, max, windowMs, message = 'Too many requests' }: RateLimitOptions) => {
  const now = Date.now()
  const current = buckets.get(key)

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return
  }

  if (current.count >= max) {
    throw createError({
      statusCode: 429,
      statusMessage: message,
    })
  }

  current.count += 1
}
