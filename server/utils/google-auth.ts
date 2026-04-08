export const getGoogleAccessToken = async (event: any, refreshTokenOverride?: string) => {
  const config = useRuntimeConfig(event)
  const refreshToken = refreshTokenOverride || String(config.googleRefreshToken || '')

  if (!config.googleClientId || !config.googleClientSecret || !refreshToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Google API credentials are not configured',
    })
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: String(config.googleClientId),
      client_secret: String(config.googleClientSecret),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw createError({
      statusCode: 502,
      statusMessage: `Failed to refresh Google token: ${response.status} ${errorText}`,
    })
  }

  const data = await response.json()
  if (!data?.access_token) {
    throw createError({
      statusCode: 502,
      statusMessage: 'No access token returned from Google',
    })
  }

  return String(data.access_token)
}
