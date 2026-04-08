import { getGoogleAccessToken } from './google-auth'

type GTMTag = {
  name?: string
  type?: string
  paused?: boolean
  firingTriggerId?: string[]
  tagId?: string
  parameter?: Array<{ key?: string; value?: string }>
  consentSettings?: { consentStatus?: string }
}

type GTMTrigger = {
  name?: string
  type?: string
  triggerId?: string
  filter?: Array<{
    parameter?: Array<{ value?: string }>
  }>
}

type GTMVariable = { name?: string; type?: string }

export const fetchGTMContainer = async (
  event: any,
  payload: { accountId: string; containerId: string; workspaceId: string; refreshToken?: string }
) => {
  const accessToken = await getGoogleAccessToken(event, payload.refreshToken)
  const headers = { Authorization: `Bearer ${accessToken}` }
  const base = `https://www.googleapis.com/tagmanager/v2/accounts/${payload.accountId}/containers/${payload.containerId}/workspaces/${payload.workspaceId}`

  const [tagsRes, triggersRes, variablesRes] = await Promise.all([
    fetch(`${base}/tags`, { headers }),
    fetch(`${base}/triggers`, { headers }),
    fetch(`${base}/variables`, { headers }),
  ])

  if (!tagsRes.ok || !triggersRes.ok || !variablesRes.ok) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch GTM data. Check GTM IDs and account permissions.',
    })
  }

  const [tagsData, triggersData, variablesData] = await Promise.all([tagsRes.json(), triggersRes.json(), variablesRes.json()])
  return {
    tags: (tagsData?.tag || []) as GTMTag[],
    triggers: (triggersData?.trigger || []) as GTMTrigger[],
    variables: (variablesData?.variable || []) as GTMVariable[],
  }
}

export const analyzeGTMContainer = (tags: GTMTag[], triggers: GTMTrigger[], variables: GTMVariable[]) => {
  const ALL_PAGES_TRIGGER_ID = '2147479553'

  const pausedTags = tags.filter((t) => t.paused)
  const conversionTriggers = triggers.filter((t) =>
    t.filter?.some((f) =>
      f.parameter?.some((p) => {
        const v = String(p.value || '').toLowerCase()
        return v.includes('thank-you') || v.includes('thank_you') || v.includes('confirmation') || v.includes('success')
      })
    )
  )

  const hasConsentMode = tags.some((t) =>
    t.consentSettings?.consentStatus === 'needed' || t.consentSettings?.consentStatus === 'notRequired'
  )
  const hasGA4 = tags.some((t) => (t.type === 'googtag' || t.type === 'gaawe') && !t.paused)
  const hasGoogleAds = tags.some((t) => t.type === 'awct' && !t.paused)
  const hasFormTracking = triggers.some((t) => t.type === 'formSubmission')
  const hasScrollTracking = triggers.some((t) => t.type === 'scrollDepth')
  const behaviorTools = tags.filter((t) => {
    if (t.paused) return false
    const n = String(t.name || '').toLowerCase()
    return ['clarity', 'hotjar', 'truconversion', 'plerdy', 'mouseflow', 'fullstory'].some((tool) => n.includes(tool))
  })

  const flags: Array<{ severity: 'critical' | 'warning' | 'ok' | 'info'; title: string; desc: string }> = []
  if (!hasConsentMode) {
    flags.push({
      severity: 'critical',
      title: 'No consent mode configured',
      desc: 'Tags may fire without user consent and reduce compliance quality.',
    })
  }
  if (pausedTags.length > 0) {
    flags.push({
      severity: 'critical',
      title: `${pausedTags.length} tag${pausedTags.length > 1 ? 's' : ''} paused`,
      desc: pausedTags.map((t) => t.name).filter(Boolean).join(', ') || 'Some tags are paused.',
    })
  }
  if (!hasFormTracking && conversionTriggers.length > 0) {
    flags.push({
      severity: 'critical',
      title: 'No form submission trigger',
      desc: 'Conversion tracking may rely only on thank-you redirects.',
    })
  }
  if (conversionTriggers.length === 0) {
    flags.push({
      severity: 'critical',
      title: 'No conversion page detected',
      desc: 'No thank-you or confirmation trigger found.',
    })
  }
  if (variables.length < 5) {
    flags.push({
      severity: 'warning',
      title: `Only ${variables.length} variable${variables.length !== 1 ? 's' : ''} defined`,
      desc: 'Container may be under-configured for segmentation and CRO reporting.',
    })
  }
  if (!hasScrollTracking) {
    flags.push({
      severity: 'warning',
      title: 'No scroll depth tracking',
      desc: 'Scroll behavior cannot be measured.',
    })
  }
  if (behaviorTools.length > 1) {
    flags.push({
      severity: 'warning',
      title: `${behaviorTools.length} behavior recording tools active`,
      desc: 'Multiple behavior tools can increase script weight and duplicate data.',
    })
  }
  if (hasGA4) {
    flags.push({
      severity: 'ok',
      title: 'GA4 active and firing',
      desc: 'GA4 tag appears configured and active.',
    })
  }
  if (hasGoogleAds && conversionTriggers.length > 0) {
    flags.push({
      severity: 'ok',
      title: 'Google Ads conversion tracking present',
      desc: 'Google Ads conversion setup appears present.',
    })
  }

  return {
    summary: {
      totalTags: tags.length,
      pausedTags: pausedTags.length,
      conversionTriggers: conversionTriggers.length,
      variablesDefined: variables.length,
    },
    flags,
    rawData: {
      tags: tags.map((t) => ({
        name: t.name,
        type: t.type,
        paused: Boolean(t.paused),
        firesOnAllPages: Array.isArray(t.firingTriggerId) ? t.firingTriggerId.includes(ALL_PAGES_TRIGGER_ID) : false,
        tagId: t.tagId,
      })),
      triggers: triggers.map((t) => ({ name: t.name, type: t.type, triggerId: t.triggerId })),
      variables: variables.map((v) => ({ name: v.name, type: v.type })),
    },
  }
}
