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
        <LazyClientDashboardTabCRO
          :pages="dashboard.pages"
          :page-types="dashboard.pageTypes"
          :user-types="dashboard.userTypes"
          :funnel-stages="dashboard.funnelStages"
          :is-admin="isAdmin"
          @save="saveDashboard"
        />
        <p v-if="saveMessage" class="text-sm text-green-600">{{ saveMessage }}</p>
      </div>
      <LazySiteHealthPanel
        v-else-if="activeTab === 'Site Health'"
        :is-admin="isAdmin"
        :loading="gtm.loading.value"
        :connecting="gtm.connecting.value"
        :mapping-saving="gtm.mappingSaving.value"
        :configured="gtm.configured.value"
        :connected="gtm.connected.value"
        :summary="gtm.summary.value"
        :services="gtm.services.value"
        :ids="gtm.ids.value"
        :filtered-flags="gtm.filteredFlags.value"
        :active-severity="gtm.activeSeverity.value"
        :counts="gtm.severityCounts.value"
        :updated-at="gtm.updatedAt.value"
        :error="gtm.error.value"
        @refresh="gtm.refresh"
        @connect="gtm.connect('all')"
        @disconnect="gtm.disconnect"
        @save-mapping="(value) => { gtm.ids.value = value; gtm.saveMapping() }"
        @filter="gtm.setSeverityFilter"
      />
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

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

defineRouteRules({
  ssr: false,
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
  await router.push('/login')
}

const loadDashboard = async () => {
  loadError.value = ''
  try {
    const session = await $fetch('/api/auth/session')
    isAdmin.value = (session as any)?.user?.role === 'admin'

    if (!isAdmin.value && (session as any)?.user?.slug !== clientSlug.value) {
      await router.push('/login')
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

const gtm = useGtmInsights(clientSlug, isAdmin)

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
  await gtm.load()
})
</script>
