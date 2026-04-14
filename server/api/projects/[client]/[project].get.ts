import { useSupabaseServer } from '../../../utils/supabase'
import { requireClientScope } from '../../../utils/auth'

const defaultPageTypes = [
  { id: 'lead-gen', label: 'Lead gen', color: '#0F6E56', bgColor: '#E1F5EE' },
  { id: 'trust-authority', label: 'Trust / authority', color: '#534AB7', bgColor: '#EEEDFE' },
  { id: 'seo-education', label: 'SEO / education', color: '#854F0B', bgColor: '#FAEEDA' },
  { id: 'urgent-conversion', label: 'Urgent conversion', color: '#993C1D', bgColor: '#FAECE7' },
  { id: 'support-retention', label: 'Support / retention', color: '#185FA5', bgColor: '#E6F1FB' },
]

const defaultUserTypes = [
  { id: 'researcher', label: 'Researcher persona', color: '#1D9E75' },
  { id: 'trustseeker', label: 'Trust-seeker persona', color: '#7F77DD' },
  { id: 'urgent', label: 'Urgent need persona', color: '#D85A30' },
]

const defaultFunnelStages = [
  { id: 'awareness', label: 'Awareness', color: '#2563EB' },
  { id: 'consideration', label: 'Consideration', color: '#7C3AED' },
  { id: 'decision', label: 'Decision', color: '#EA580C' },
]

const defaultPages = [
  {
    id: 1,
    name: 'Homepage',
    url: '/',
    pageTypeIds: ['trust-authority'],
    userTypeIds: ['trustseeker', 'researcher', 'urgent'],
    funnelStageIds: ['awareness'],
    goal: 'Add content...',
    cro: 'Add content...',
    seo: 'Add content...',
    kw: ['dayo dental'],
    schema: 'Organization, WebSite, FAQPage',
    cta: 'Get Free Estimate',
  },
]

export default defineEventHandler(async (event) => {
  const { client, project } = getRouterParams(event)
  const clientSlug = String(client)
  const projectSlug = String(project)
  const user = await requireClientScope(event, clientSlug)

  const supabase = useSupabaseServer(event)
  const { data, error } = await supabase
    .from('project_dashboards')
    .select('payload')
    .eq('client_slug', clientSlug)
    .eq('project_slug', projectSlug)
    .maybeSingle()

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Failed to load project dashboard' })
  }

  const payload = data?.payload || {
    pageTypes: defaultPageTypes,
    userTypes: defaultUserTypes,
    funnelStages: defaultFunnelStages,
    pages: defaultPages,
  }

  return {
    payload,
    canEdit: user.role === 'admin',
  }
})
