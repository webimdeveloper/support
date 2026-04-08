import { createHmac, randomUUID } from 'node:crypto'

type OAuthService = 'gtm' | 'ga4' | 'gsc' | 'all'

const scopeMap: Record<OAuthService, string[]> = {
  gtm: ['https://www.googleapis.com/auth/tagmanager.readonly'],
  ga4: ['https://www.googleapis.com/auth/analytics.readonly'],
  gsc: ['https://www.googleapis.com/auth/webmasters.readonly'],
  all: [
    'https://www.googleapis.com/auth/tagmanager.readonly',
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
  ],
}

const getStateSecret = (event: any) => {
  const config = useRuntimeConfig(event)
  return String(config.session?.password || '')
}

export const getScopesForService = (service: OAuthService) => scopeMap[service] || scopeMap.all

export const buildSignedState = (event: any, payload: Record<string, string>) => {
  const data = Buffer.from(JSON.stringify({ ...payload, nonce: randomUUID(), ts: Date.now() })).toString('base64url')
  const signature = createHmac('sha256', getStateSecret(event)).update(data).digest('base64url')
  return `${data}.${signature}`
}

export const verifySignedState = (event: any, state: string) => {
  const [data, signature] = String(state || '').split('.')
  if (!data || !signature) return null
  const expected = createHmac('sha256', getStateSecret(event)).update(data).digest('base64url')
  if (expected !== signature) return null
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
    if (!parsed?.ts || Date.now() - Number(parsed.ts) > 15 * 60 * 1000) return null
    return parsed as Record<string, string>
  } catch {
    return null
  }
}

export const exchangeGoogleCode = async (event: any, code: string, redirectUri: string) => {
  const config = useRuntimeConfig(event)
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: String(config.googleClientId || ''),
      client_secret: String(config.googleClientSecret || ''),
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw createError({ statusCode: 502, statusMessage: `Google code exchange failed: ${response.status} ${text}` })
  }
  return await response.json()
}
