# TECHNICAL TASK: CRO Portal — GTM Integration Panel with Claude AI Analysis

**Project:** CRO Portal (existing Next.js app)  
**Task scope:** Add an Integrations Panel to the client detail page, starting with GTM data fetching and AI-powered audit  
**Stack:** Next.js App Router, Tailwind CSS, shadcn/ui, PostgreSQL (or existing DB)

---

## PART 1 — CREDENTIALS & ENVIRONMENT

### 1.1 What Goes in `.env.local`

Create or update `.env.local` at the project root with these exact values:

```env
# ─────────────────────────────────────────
# ANTHROPIC — Claude AI
# ─────────────────────────────────────────
# Get from: https://console.anthropic.com → API Keys
ANTHROPIC_API_KEY=REPLACE_WITH_NEW_KEY_AFTER_ROTATING

# ─────────────────────────────────────────
# GOOGLE OAUTH — Agency account credentials
# These never change regardless of how many clients you add
# ─────────────────────────────────────────
GOOGLE_CLIENT_ID=26107969539-8e4u25eirftcoecu725klela3hknjtsp.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=REPLACE_WITH_GOOGLE_CLIENT_SECRET

# Single refresh token covering all 3 Google APIs
# Represents webim.developer@gmail.com (agency Google account)
# Valid for: tagmanager.readonly + analytics.readonly + webmasters.readonly
GOOGLE_REFRESH_TOKEN=REPLACE_WITH_NEW_REFRESH_TOKEN_AFTER_ROTATING
```

### 1.2 Security Rules — Cursor Must Follow These

- **Never** hardcode any credential in source code
- **Never** log token values to console, even in development
- **Never** return token values in API responses to the frontend
- **Always** use `process.env.VARIABLE_NAME` to access credentials
- All Google API calls and Claude API calls must be **server-side only** (API routes)
- The frontend never sees any credentials — it only receives processed JSON results
- `.env.local` is already git-ignored in Next.js — verify this before proceeding

### 1.3 What Is Already Set Up in Google Cloud

The following is already configured — Cursor does NOT need to set this up:

- Google Cloud project created (name: "Support Widev")
- APIs enabled: Tag Manager API, Google Analytics Data API, Search Console API, PageSpeed Insights API
- OAuth 2.0 client created (Web application type)
- OAuth consent screen configured (Testing mode, External)
- Test user added: webim.developer@gmail.com
- Redirect URI added: https://developers.google.com/oauthplayground
- Refresh token obtained covering all 3 scopes

### 1.4 How Multi-Client Works

**Important architecture note:**

The agency Google account (`webim.developer@gmail.com`) is added as a Viewer/user directly inside each client's GTM, GA4, and Search Console. This means:

- One `GOOGLE_REFRESH_TOKEN` in `.env.local` works for ALL clients
- No client ever shares their own Google credentials with us
- Each client's GTM/GA4 IDs are stored in the database per client record
- Adding a new client = add their IDs to the DB + they invite our Google account to their tools

---

## PART 2 — DATABASE CHANGES

### 2.1 Add Columns to Clients Table

```sql
-- Integration IDs (stored per client)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gtm_account_id     VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gtm_container_id   VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gtm_workspace_id   VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ga4_property_id    VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gsc_site_url       VARCHAR(255);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS clarity_project_id VARCHAR(50);
ALTER TABLE clients ADD COLUMN IF NOT EXISTS hotjar_site_id     VARCHAR(50);

-- GTM audit cache (refreshed when user clicks Update)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gtm_audit_data     JSONB;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gtm_ai_analysis    TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS gtm_last_updated   TIMESTAMP;
```

### 2.2 Seed First Client — Dayo Global Medical Network

```sql
-- Update the existing Dayo client record with their integration IDs
-- Replace 'Dayo Global Medical Network' with whatever name exists in your DB
UPDATE clients
SET
  gtm_account_id   = '6102250483',
  gtm_container_id = '117946176',
  gtm_workspace_id = '32',
  ga4_property_id  = '376303914'
WHERE name ILIKE '%dayo%';
```

---

## PART 3 — BACKEND — FILES TO CREATE

### 3.1 `lib/google-auth.js`

```javascript
/**
 * Exchanges the stored refresh token for a fresh access token.
 * Access tokens expire in 1 hour — always call this before any Google API request.
 * Never cache the returned access token.
 */
export async function getGoogleAccessToken() {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
      grant_type:    'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh Google token: ${response.status} — ${error}`)
  }

  const data = await response.json()

  if (!data.access_token) {
    throw new Error('No access token returned from Google')
  }

  return data.access_token
}
```

### 3.2 `lib/gtm-client.js`

```javascript
import { getGoogleAccessToken } from './google-auth'

/**
 * Fetches all tags, triggers, and variables from a GTM container.
 * Uses the client's stored GTM IDs from the database.
 */
export async function fetchGTMContainer({ accountId, containerId, workspaceId }) {
  const accessToken = await getGoogleAccessToken()

  const base = `https://www.googleapis.com/tagmanager/v2/accounts/${accountId}/containers/${containerId}/workspaces/${workspaceId}`
  const headers = { Authorization: `Bearer ${accessToken}` }

  const [tagsRes, triggersRes, variablesRes] = await Promise.all([
    fetch(`${base}/tags`,      { headers }),
    fetch(`${base}/triggers`,  { headers }),
    fetch(`${base}/variables`, { headers }),
  ])

  if (!tagsRes.ok || !triggersRes.ok || !variablesRes.ok) {
    throw new Error('Failed to fetch GTM data — check account/container/workspace IDs and access permissions')
  }

  const [tagsData, triggersData, variablesData] = await Promise.all([
    tagsRes.json(),
    triggersRes.json(),
    variablesRes.json(),
  ])

  return {
    tags:      tagsData.tag      || [],
    triggers:  triggersData.trigger  || [],
    variables: variablesData.variable || [],
  }
}
```

### 3.3 `lib/gtm-audit.js`

```javascript
/**
 * Analyzes raw GTM container data and returns structured audit findings.
 * Returns: { summary, flags, rawData }
 */
export function analyzeGTMContainer(tags, triggers, variables) {
  const ALL_PAGES_TRIGGER_ID = '2147479553' // GTM built-in "All Pages" trigger ID

  // ── Derived data ──────────────────────────────────────────────
  const pausedTags = tags.filter(t => t.paused)

  const conversionTriggers = triggers.filter(t =>
    t.filter?.some(f =>
      f.parameter?.some(p =>
        typeof p.value === 'string' && (
          p.value.includes('thank-you') ||
          p.value.includes('thank_you') ||
          p.value.includes('confirmation') ||
          p.value.includes('success')
        )
      )
    )
  )

  const hasConsentMode = tags.some(t =>
    t.consentSettings?.consentStatus === 'needed' ||
    t.consentSettings?.consentStatus === 'notRequired'
  )

  const hasGA4 = tags.some(t =>
    (t.type === 'googtag' || t.type === 'gaawe') && !t.paused
  )

  const hasGoogleAds = tags.some(t => t.type === 'awct' && !t.paused)

  const hasFormTracking  = triggers.some(t => t.type === 'formSubmission')
  const hasScrollTracking = triggers.some(t => t.type === 'scrollDepth')

  const behaviorTools = tags.filter(t =>
    !t.paused &&
    ['clarity', 'hotjar', 'truconversion', 'plerdy', 'mouseflow', 'fullstory']
      .some(tool => t.name?.toLowerCase().includes(tool))
  )

  const metaPixel = tags.find(t =>
    !t.paused && (
      t.name?.toLowerCase().includes('meta pixel') ||
      t.name?.toLowerCase().includes('facebook pixel')
    )
  )

  const hasCallTracking = triggers.some(t =>
    t.filter?.some(f =>
      f.parameter?.some(p => typeof p.value === 'string' && p.value.includes('tel:'))
    )
  )

  // ── Build flags ───────────────────────────────────────────────
  const flags = []

  // CRITICAL — must fix, impacts data or compliance
  if (!hasConsentMode)
    flags.push({
      severity: 'critical',
      title: 'No consent mode configured',
      desc: 'All 16 tags fire without user consent. Required for GDPR/CCPA compliance. Also needed for accurate GA4 and Google Ads conversion modeling.',
    })

  if (pausedTags.length > 0)
    flags.push({
      severity: 'critical',
      title: `${pausedTags.length} tag${pausedTags.length > 1 ? 's' : ''} paused`,
      desc: `${pausedTags.map(t => t.name).join(', ')} — these tags collect no data. Confirm if intentional or a deployment mistake.`,
    })

  if (!hasFormTracking && conversionTriggers.length > 0)
    flags.push({
      severity: 'critical',
      title: 'No form submission trigger',
      desc: 'Conversions rely solely on the thank-you page redirect. Any form that submits without that redirect loses the conversion silently.',
    })

  if (conversionTriggers.length === 0)
    flags.push({
      severity: 'critical',
      title: 'No conversion page detected',
      desc: 'No trigger found for a thank-you, confirmation, or success page. Conversion tracking may be completely missing.',
    })

  // WARNING — should fix, impacts CRO performance
  if (variables.length < 5)
    flags.push({
      severity: 'warning',
      title: `Only ${variables.length} variable${variables.length !== 1 ? 's' : ''} defined`,
      desc: 'Container is under-configured. Missing: page_type, scroll depth threshold, form ID, user type. These limit GA4 segmentation and CRO reporting.',
    })

  if (!hasScrollTracking)
    flags.push({
      severity: 'warning',
      title: 'No scroll depth tracking',
      desc: 'Cannot measure how far visitors scroll. Essential for knowing if CTAs are visible on long pages.',
    })

  if (behaviorTools.length > 1)
    flags.push({
      severity: 'warning',
      title: `${behaviorTools.length} behavior recording tools active simultaneously`,
      desc: `${behaviorTools.map(t => t.name).join(', ')} — running multiple heatmap tools adds page weight and collects duplicate data. Consolidate to one.`,
    })

  if (metaPixel) {
    const pixelHtml = metaPixel.parameter?.find(p => p.key === 'html')?.value || ''
    if (!pixelHtml.includes("fbq('track', 'Lead'") && !pixelHtml.includes("fbq('track', 'CompleteRegistration'"))
      flags.push({
        severity: 'warning',
        title: 'Meta Pixel fires PageView only',
        desc: 'No Lead or conversion events configured for Meta. Ad algorithm can only optimize for page views, not actual leads — wasting ad spend.',
      })
  }

  // OK — working correctly
  if (hasGA4)
    flags.push({
      severity: 'ok',
      title: 'GA4 active and firing',
      desc: 'Google Analytics 4 tag is configured and firing on all pages.',
    })

  if (hasCallTracking)
    flags.push({
      severity: 'ok',
      title: 'Click-to-call tracking active',
      desc: 'Phone number clicks are tracked as GA4 events — important for medical/dental sites where calls are a primary conversion.',
    })

  if (hasGoogleAds && conversionTriggers.length > 0)
    flags.push({
      severity: 'ok',
      title: 'Google Ads conversion tracking present',
      desc: 'Ads conversion tag is configured and firing on conversion pages.',
    })

  if (behaviorTools.length === 1)
    flags.push({
      severity: 'ok',
      title: `${behaviorTools[0].name} installed`,
      desc: 'Session recordings and heatmaps are being collected.',
    })

  // ── Return structured result ──────────────────────────────────
  return {
    summary: {
      totalTags:          tags.length,
      pausedTags:         pausedTags.length,
      conversionTriggers: conversionTriggers.length,
      variablesDefined:   variables.length,
    },
    flags,
    rawData: {
      tags: tags.map(t => ({
        name:           t.name,
        type:           t.type,
        paused:         t.paused || false,
        firesOnAllPages: t.firingTriggerId?.includes(ALL_PAGES_TRIGGER_ID) || false,
        tagId:          t.tagId,
      })),
      triggers: triggers.map(t => ({
        name:      t.name,
        type:      t.type,
        triggerId: t.triggerId,
      })),
      variables: variables.map(v => ({
        name: v.name,
        type: v.type,
      })),
    },
  }
}
```

### 3.4 `lib/claude-analysis.js`

```javascript
/**
 * Sends GTM audit data to Claude and returns AI-generated recommendations.
 */
export async function getGTMAIAnalysis(auditData, clientName) {
  const prompt = `You are a senior CRO and analytics specialist reviewing a Google Tag Manager audit for client "${clientName}".

CONTAINER SUMMARY:
- Total tags: ${auditData.summary.totalTags}
- Paused tags: ${auditData.summary.pausedTags}
- Conversion triggers found: ${auditData.summary.conversionTriggers}
- Variables defined: ${auditData.summary.variablesDefined}

AUDIT FLAGS DETECTED:
${auditData.flags.map(f => `[${f.severity.toUpperCase()}] ${f.title}: ${f.desc}`).join('\n')}

ALL TAGS IN CONTAINER:
${auditData.rawData.tags.map(t =>
  `- ${t.name} (type: ${t.type})${t.paused ? ' [PAUSED]' : ''}${t.firesOnAllPages ? ' [fires on all pages]' : ''}`
).join('\n')}

TRIGGERS:
${auditData.rawData.triggers.map(t => `- ${t.name} (${t.type})`).join('\n')}

VARIABLES:
${auditData.rawData.variables.map(v => `- ${v.name} (${v.type})`).join('\n')}

Based on this data, provide:

1. ONE sentence summarizing the overall tracking health of this container.

2. Up to 5 prioritized recommendations. For each write:
   - **What to fix:** (specific action)
   - **Why it matters:** (CRO or revenue impact)
   - **Effort:** Quick (under 1 hour) / Medium (half day) / Complex (1+ days)

Keep it concise, specific, and focused on revenue impact. Do not repeat information already obvious from the flags.`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type':      'application/json',
      'x-api-key':         process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-5',
      max_tokens: 1000,
      messages:   [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Claude API error: ${response.status} — ${error}`)
  }

  const data = await response.json()
  return data.content[0].text
}
```

### 3.5 `app/api/gtm/audit/route.js`

```javascript
import { NextResponse } from 'next/server'
import { fetchGTMContainer } from '@/lib/gtm-client'
import { analyzeGTMContainer } from '@/lib/gtm-audit'
import { getGTMAIAnalysis } from '@/lib/claude-analysis'

// Replace this with your actual DB client import
// e.g. import { db } from '@/lib/db'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get('clientId')

  if (!clientId) {
    return NextResponse.json({ error: 'clientId is required' }, { status: 400 })
  }

  try {
    // 1. Load client from DB
    const client = await db.clients.findById(clientId)

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // 2. Check GTM is configured for this client
    if (!client.gtm_account_id || !client.gtm_container_id || !client.gtm_workspace_id) {
      return NextResponse.json({
        connected: false,
        error: 'GTM not configured for this client',
      }, { status: 200 })
    }

    // 3. Fetch raw GTM data
    const { tags, triggers, variables } = await fetchGTMContainer({
      accountId:   client.gtm_account_id,
      containerId: client.gtm_container_id,
      workspaceId: client.gtm_workspace_id,
    })

    // 4. Run audit logic
    const audit = analyzeGTMContainer(tags, triggers, variables)

    // 5. Get Claude AI analysis
    const aiAnalysis = await getGTMAIAnalysis(audit, client.name)

    // 6. Cache results in DB
    await db.clients.update(clientId, {
      gtm_audit_data:   audit,
      gtm_ai_analysis:  aiAnalysis,
      gtm_last_updated: new Date().toISOString(),
    })

    // 7. Return to frontend
    return NextResponse.json({
      connected:  true,
      summary:    audit.summary,
      flags:      audit.flags,
      rawData:    audit.rawData,
      aiAnalysis,
      updatedAt:  new Date().toISOString(),
    })

  } catch (error) {
    console.error('GTM audit failed:', error.message)
    return NextResponse.json({
      error: 'Failed to fetch GTM data. Check that the agency Google account has been granted access to this client GTM container.',
    }, { status: 500 })
  }
}
```

---

## PART 4 — FRONTEND — COMPONENTS TO CREATE

### File Structure

```
components/client/integrations/
  IntegrationsPanel.jsx       ← parent, renders everything
  IntegrationIconsRow.jsx     ← horizontal row of service icons
  UpdateButton.jsx            ← triggers data refresh
  LastUpdated.jsx             ← "Updated 3 minutes ago"
  gtm/
    GTMPanel.jsx              ← full GTM panel (connected state)
    GTMNotConnected.jsx       ← empty state when GTM IDs not set
    GTMSummaryCards.jsx       ← 4 metric cards in a row
    GTMFlags.jsx              ← list of color-coded audit flags
    GTMFlagRow.jsx            ← single flag row component
    GTMAIAnalysis.jsx         ← Claude recommendations block
```

### IntegrationIconsRow — Service Icons

Show these 6 icons in a horizontal row, then the Update button:

| Icon label | Status |
|------------|--------|
| GTM | Active — build this |
| GA4 | Placeholder (greyed out, "Coming soon" tooltip) |
| Search Console | Placeholder |
| PageSpeed | Placeholder |
| Hotjar | Placeholder |
| Clarity | Placeholder |

Each icon has a status indicator dot (bottom-right corner):
- `connected` → green dot
- `not_connected` → grey dot  
- `loading` → spinner replaces dot
- `error` → red dot

### GTMSummaryCards — 4 Cards

```
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│      16      │ │      2       │ │      1       │ │      2       │
│  Total tags  │ │ Paused tags  │ │  Conversion  │ │  Variables   │
│              │ │              │ │   triggers   │ │   defined    │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
     neutral          amber            green             amber
                   (if > 0)         (if > 0)           (if < 5)
```

Card color logic:
- Total tags → always neutral/grey
- Paused tags → amber if > 0, green if 0
- Conversion triggers → red if 0, green if > 0
- Variables defined → red if < 3, amber if 3-4, green if >= 5

### GTMFlagRow — Single Flag Component

```
┌────────────────────────────────────────────────────────┐
│ ▌  No consent mode configured               [CRITICAL] │
│    All tags fire without user consent...               │
└────────────────────────────────────────────────────────┘
```

Left border color by severity:
- `critical` → red (`border-red-500`)
- `warning` → amber (`border-amber-400`)
- `ok` → green (`border-green-500`)
- `info` → blue (`border-blue-400`)

Badge color matches border color.

### GTMAIAnalysis — Claude Block

- Section heading: "AI Recommendations"
- Render Claude's markdown response using a markdown renderer (e.g. `react-markdown`)
- Show skeleton loader while `aiAnalysis` is null/loading
- Small subtle label bottom-right: "Powered by Claude"

### GTMNotConnected — Empty State

Show when `client.gtm_account_id` is null:

```
┌─────────────────────────────────────────────┐
│                                             │
│   [GTM icon, greyscale]                     │
│                                             │
│   GTM not connected                         │
│   Add this client's GTM Account ID,        │
│   Container ID and Workspace ID in         │
│   client settings to enable this panel.    │
│                                             │
│   [ Go to client settings → ]              │
│                                             │
└─────────────────────────────────────────────┘
```

### Data Flow in IntegrationsPanel

```javascript
// On mount: load cached data from DB (instant, no API call)
// On "Update" click: call /api/gtm/audit?clientId=X (fresh fetch + AI)

const [gtmData, setGtmData] = useState(null)      // cached from DB on load
const [loading, setLoading] = useState(false)
const [lastUpdated, setLastUpdated] = useState(null)

// Load cached data on mount
useEffect(() => {
  fetch(`/api/clients/${clientId}/integrations`)
    .then(r => r.json())
    .then(data => {
      setGtmData(data.gtm)
      setLastUpdated(data.gtm?.updatedAt)
    })
}, [clientId])

// Update button handler
async function handleUpdate() {
  setLoading(true)
  const res = await fetch(`/api/gtm/audit?clientId=${clientId}`)
  const data = await res.json()
  setGtmData(data)
  setLastUpdated(data.updatedAt)
  setLoading(false)
}
```

---

## PART 5 — ADDITIONAL API ROUTE NEEDED

### `app/api/clients/[clientId]/integrations/route.js`

Returns cached integration data from DB (no live API calls — just reads what was last saved):

```javascript
export async function GET(request, { params }) {
  const client = await db.clients.findById(params.clientId)

  return NextResponse.json({
    gtm: client.gtm_audit_data ? {
      connected:  true,
      summary:    client.gtm_audit_data.summary,
      flags:      client.gtm_audit_data.flags,
      rawData:    client.gtm_audit_data.rawData,
      aiAnalysis: client.gtm_ai_analysis,
      updatedAt:  client.gtm_last_updated,
    } : {
      connected: false,
    },
    // Future integrations return here too:
    // ga4: { connected: false },
    // gsc: { connected: false },
  })
}
```

---

## PART 6 — IMPLEMENTATION ORDER

Follow this exact order. Each step must work before moving to the next.

```
Step 1  → Create .env.local with all credentials
Step 2  → Run DB migration (add columns to clients table)
Step 3  → Run DB seed (add Dayo's GTM + GA4 IDs)
Step 4  → Create lib/google-auth.js
Step 5  → Create lib/gtm-client.js
Step 6  → Create lib/gtm-audit.js
Step 7  → Create lib/claude-analysis.js
Step 8  → Create app/api/gtm/audit/route.js
Step 9  → TEST: call GET /api/gtm/audit?clientId=[dayo-id] 
          Expected response: 16 tags, 2 paused, 1 conversion trigger, 2 variables
          If this works, backend is complete.
Step 10 → Create app/api/clients/[clientId]/integrations/route.js
Step 11 → Create GTMFlagRow.jsx
Step 12 → Create GTMFlags.jsx
Step 13 → Create GTMSummaryCards.jsx
Step 14 → Create GTMAIAnalysis.jsx
Step 15 → Create GTMPanel.jsx (combines steps 11-14)
Step 16 → Create GTMNotConnected.jsx
Step 17 → Create LastUpdated.jsx
Step 18 → Create UpdateButton.jsx
Step 19 → Create IntegrationIconsRow.jsx
Step 20 → Create IntegrationsPanel.jsx (combines everything)
Step 21 → Add <IntegrationsPanel clientId={client.id} /> to client detail page
Step 22 → Test full flow: load page → see cached data → click Update → see fresh data
```

---

## PART 7 — EXPECTED TEST OUTPUT FOR DAYO

After calling `/api/gtm/audit?clientId=[dayo-id]` the response must contain:

```json
{
  "connected": true,
  "summary": {
    "totalTags": 16,
    "pausedTags": 2,
    "conversionTriggers": 1,
    "variablesDefined": 2
  },
  "flags": [
    { "severity": "critical", "title": "No consent mode configured", "desc": "..." },
    { "severity": "critical", "title": "2 tags paused", "desc": "Zoho SalesIQ, GHL Call Tracking..." },
    { "severity": "critical", "title": "No form submission trigger", "desc": "..." },
    { "severity": "warning",  "title": "Only 2 variables defined", "desc": "..." },
    { "severity": "warning",  "title": "No scroll depth tracking", "desc": "..." },
    { "severity": "warning",  "title": "3 behavior recording tools active simultaneously", "desc": "..." },
    { "severity": "warning",  "title": "Meta Pixel fires PageView only", "desc": "..." },
    { "severity": "ok",       "title": "GA4 active and firing", "desc": "..." },
    { "severity": "ok",       "title": "Click-to-call tracking active", "desc": "..." },
    { "severity": "ok",       "title": "Google Ads conversion tracking present", "desc": "..." }
  ],
  "aiAnalysis": "... Claude's recommendations ...",
  "updatedAt": "2026-04-08T..."
}
```

Use this as the acceptance test. If the summary numbers match and flags appear in the correct severities, the integration is working correctly.

---

## PART 8 — HOW TO ADD A SECOND CLIENT LATER

When a new client is onboarded:

1. Client adds `webim.developer@gmail.com` as Viewer in their GTM (User Management → Add user)
2. Client adds `webim.developer@gmail.com` as Viewer in their GA4 (Admin → Property Access Management → Add)
3. In the portal, create a new client record in the DB
4. Fill in their GTM IDs (found in their GTM URL: `accounts/{accountId}/containers/{containerId}/workspaces/{workspaceId}`)
5. Fill in their GA4 property ID (found in GA4 Admin → Property Settings)
6. Click Update on their client page — works immediately, no code changes needed

No new credentials, no new tokens, no new Google Cloud configuration required.
