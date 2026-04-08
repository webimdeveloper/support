<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <div class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ clientSlug }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Project: {{ projectSlug }}</p>
        </div>
        <UiButton variant="danger" @click="handleLogout">Logout</UiButton>
      </div>
    </div>

    <div class="border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex space-x-8" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="[
              activeTab === tab
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600',
              'py-4 px-1 border-b-2 font-medium text-sm',
            ]"
          >
            {{ tab }}
          </button>
        </nav>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div v-if="activeTab === 'CRO'" class="space-y-6">
        <ClientDashboardTabCRO
          :pages="dashboard.pages"
          :page-types="dashboard.pageTypes"
          :user-types="dashboard.userTypes"
          :funnel-stages="dashboard.funnelStages"
          :is-admin="isAdmin"
          @save="saveDashboard"
        />
        <p v-if="saveMessage" class="text-sm text-green-600">{{ saveMessage }}</p>
      </div>
      <div v-else-if="activeTab === 'Site Health'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">GTM Insights</h2>
          <UiButton v-if="isAdmin" :disabled="gtmLoading" @click="refreshGtmInsights">
            {{ gtmLoading ? 'Updating...' : 'Update GTM Data' }}
          </UiButton>
        </div>

        <div
          v-if="!gtmConfigured"
          class="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-200"
        >
          GTM is not configured for this client yet. Add GTM account/container/workspace IDs to the client record first.
        </div>

        <div v-else-if="gtmSummary" class="grid gap-3 md:grid-cols-4">
          <div class="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <p class="text-xs text-gray-500">Total tags</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ gtmSummary.totalTags }}</p>
          </div>
          <div class="rounded-lg border p-4" :class="gtmSummary.pausedTags > 0 ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30' : 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30'">
            <p class="text-xs text-gray-500">Paused tags</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ gtmSummary.pausedTags }}</p>
          </div>
          <div class="rounded-lg border p-4" :class="gtmSummary.conversionTriggers > 0 ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30' : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30'">
            <p class="text-xs text-gray-500">Conversion triggers</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ gtmSummary.conversionTriggers }}</p>
          </div>
          <div
            class="rounded-lg border p-4"
            :class="gtmSummary.variablesDefined >= 5 ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/30' : gtmSummary.variablesDefined >= 3 ? 'border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30' : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/30'"
          >
            <p class="text-xs text-gray-500">Variables defined</p>
            <p class="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{{ gtmSummary.variablesDefined }}</p>
          </div>
        </div>

        <div v-if="gtmFlags.length" class="space-y-2">
          <div
            v-for="(flag, idx) in gtmFlags"
            :key="`${flag.title}-${idx}`"
            class="rounded-lg border-l-4 bg-white p-3 dark:bg-gray-900"
            :class="flagSeverityClass(flag.severity)"
          >
            <div class="flex items-start justify-between gap-3">
              <p class="font-medium text-sm text-gray-900 dark:text-white">{{ flag.title }}</p>
              <span class="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded" :class="flagBadgeClass(flag.severity)">
                {{ flag.severity }}
              </span>
            </div>
            <p class="mt-1 text-xs text-gray-600 dark:text-gray-300">{{ flag.desc }}</p>
          </div>
        </div>

        <p v-if="gtmUpdatedAt" class="text-xs text-gray-500">Last updated: {{ gtmUpdatedAt }}</p>
        <p v-if="gtmError" class="text-sm text-red-600">{{ gtmError }}</p>
      </div>
      <div v-else class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400 text-lg">{{ activeTab }} tab - Coming soon</p>
      </div>
      <div class="mt-6" v-if="isAdmin">
        <UiButton variant="secondary" @click="goBackToAdmin">Back to Admin</UiButton>
      </div>
      <div class="mt-6" v-else>
        <p class="text-xs text-gray-500">Read-only mode for client users.</p>
      </div>
      <p v-if="loadError" class="text-sm text-red-600 mt-3">{{ loadError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
type PageType = { id: string; label: string; color: string; bgColor: string }
type UserType = { id: string; label: string; color: string }
type FunnelStage = { id: string; label: string; color: string }
type Page = {
  id: number
  name: string
  url: string
  pageTypeIds: string[]
  userTypeIds: string[]
  funnelStageIds: string[]
  goal: string
  cro: string
  seo: string
  kw: string[]
  schema: string
  cta: string
}
type DashboardPayload = { pageTypes: PageType[]; userTypes: UserType[]; funnelStages: FunnelStage[]; pages: Page[] }
type GTMSummary = { totalTags: number; pausedTags: number; conversionTriggers: number; variablesDefined: number }
type GTMFlag = { severity: 'critical' | 'warning' | 'ok' | 'info'; title: string; desc: string }

definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const clientSlug = computed(() => String(route.params.client || ''))
const projectSlug = computed(() => String(route.params.project || ''))
const activeTab = ref('CRO')
const tabs = ['CRO', 'Site Health', 'Assets', 'Reports']
const isAdmin = ref(false)
const loadError = ref('')
const saveMessage = ref('')
const gtmConfigured = ref(false)
const gtmSummary = ref<GTMSummary | null>(null)
const gtmFlags = ref<GTMFlag[]>([])
const gtmUpdatedAt = ref<string>('')
const gtmError = ref('')
const gtmLoading = ref(false)
const dashboard = reactive<DashboardPayload>({
  pageTypes: [],
  userTypes: [],
  funnelStages: [],
  pages: [],
})

const goBackToAdmin = async () => {
  await router.push('/admin')
}

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await router.push('/')
}

const loadDashboard = async () => {
  loadError.value = ''
  try {
    const session = await $fetch('/api/auth/session')
    isAdmin.value = (session as any)?.user?.role === 'admin'

    if (!isAdmin.value && (session as any)?.user?.slug !== clientSlug.value) {
      await router.push('/')
      return
    }

    const response = await $fetch(`/api/projects/${clientSlug.value}/${projectSlug.value}`)
    const payload = (response as any).payload as DashboardPayload
    dashboard.pageTypes = payload.pageTypes || []
    dashboard.userTypes = payload.userTypes || []
    dashboard.funnelStages = payload.funnelStages || []
    dashboard.pages = (payload.pages || []).map((page: any) => ({
      ...page,
      pageTypeIds: Array.isArray(page.pageTypeIds)
        ? page.pageTypeIds
        : page.pageTypeId
          ? [page.pageTypeId]
          : [],
      userTypeIds: Array.isArray(page.userTypeIds) ? page.userTypeIds : [],
      funnelStageIds: Array.isArray(page.funnelStageIds) ? page.funnelStageIds : [],
    }))
  } catch (error: any) {
    loadError.value = error?.data?.statusMessage || 'Failed to load project dashboard'
  }
}

const loadGtmInsights = async () => {
  gtmError.value = ''
  try {
    const response = await $fetch(`/api/integrations/${clientSlug.value}/gtm`)
    const payload = response as any
    gtmConfigured.value = Boolean(payload?.configured)
    gtmSummary.value = payload?.cached?.summary || null
    gtmFlags.value = payload?.cached?.flags || []
    gtmUpdatedAt.value = payload?.cached?.updatedAt || ''
  } catch (error: any) {
    gtmError.value = error?.data?.statusMessage || 'Failed to load GTM insights'
  }
}

const refreshGtmInsights = async () => {
  if (!isAdmin.value) return
  gtmLoading.value = true
  gtmError.value = ''
  try {
    const response = await $fetch(`/api/integrations/${clientSlug.value}/gtm.refresh`, {
      method: 'POST',
    })
    const payload = response as any
    gtmConfigured.value = true
    gtmSummary.value = payload?.summary || null
    gtmFlags.value = payload?.flags || []
    gtmUpdatedAt.value = payload?.updatedAt || ''
  } catch (error: any) {
    gtmError.value = error?.data?.statusMessage || 'Failed to update GTM insights'
  } finally {
    gtmLoading.value = false
  }
}

const flagSeverityClass = (severity: GTMFlag['severity']) => {
  if (severity === 'critical') return 'border-red-500'
  if (severity === 'warning') return 'border-amber-400'
  if (severity === 'ok') return 'border-green-500'
  return 'border-blue-400'
}

const flagBadgeClass = (severity: GTMFlag['severity']) => {
  if (severity === 'critical') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  if (severity === 'warning') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
  if (severity === 'ok') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
}

const saveDashboard = async (payload: DashboardPayload) => {
  if (!isAdmin.value) return
  saveMessage.value = ''
  await $fetch(`/api/projects/${clientSlug.value}/${projectSlug.value}`, {
    method: 'PUT',
    body: { payload },
  })
  dashboard.pageTypes = payload.pageTypes
  dashboard.userTypes = payload.userTypes
  dashboard.funnelStages = payload.funnelStages
  dashboard.pages = payload.pages
  saveMessage.value = 'Changes saved'
}

onMounted(async () => {
  await loadDashboard()
  await loadGtmInsights()
})
</script>
