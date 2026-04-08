export type Severity = 'critical' | 'warning' | 'ok' | 'info'

export type GTMSummary = {
  totalTags: number
  pausedTags: number
  conversionTriggers: number
  variablesDefined: number
}

export type GTMFlag = {
  severity: Severity
  title: string
  desc: string
}

export type GTMCachedData = {
  summary: GTMSummary | null
  flags: GTMFlag[]
  rawData: unknown
  aiAnalysis?: string
  updatedAt: string | null
}

export type IntegrationEnvelope<T> = {
  success: boolean
  data: T | null
  error: { code: string; message: string } | null
}

export type GTMStatusData = {
  configured: boolean
  connected: boolean
  ids?: {
    accountId: string
    containerId: string
    workspaceId: string
    ga4PropertyId?: string
    gscSiteUrl?: string
  }
  cached: GTMCachedData | null
  services?: {
    gtm: boolean
    ga4: boolean
    gsc: boolean
  }
}
