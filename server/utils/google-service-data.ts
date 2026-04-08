import { getGoogleAccessToken } from './google-auth'

export const fetchGA4Snapshot = async (event: any, propertyId: string, refreshToken?: string) => {
  const accessToken = await getGoogleAccessToken(event, refreshToken)
  const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'sessions' }, { name: 'engagementRate' }],
      limit: 20,
    }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw createError({ statusCode: 502, statusMessage: `Failed GA4 fetch: ${response.status} ${text}` })
  }
  return await response.json()
}

export const fetchGSCSnapshot = async (event: any, siteUrl: string, refreshToken?: string) => {
  const accessToken = await getGoogleAccessToken(event, refreshToken)
  const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      startDate: new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10),
      endDate: new Date().toISOString().slice(0, 10),
      dimensions: ['page'],
      rowLimit: 20,
    }),
  })
  if (!response.ok) {
    const text = await response.text()
    throw createError({ statusCode: 502, statusMessage: `Failed GSC fetch: ${response.status} ${text}` })
  }
  return await response.json()
}
