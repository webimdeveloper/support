<template>
  <div class="p-8">
    <AdminHeader @logout="handleLogout" />

    <!-- Add Client button -->
    <UiButton
      @click="handleAddClient"
      class="mb-8"
      variant="primary"
    >
      Add Client
    </UiButton>

    <AdminClientTable
      :clients="clients"
      :status-tone="statusTone"
      @save-project="saveProject"
      @project-click="handleProjectClick"
      @enable-project-edit="enableProjectEdit"
      @update-service-mode="updateServiceMode"
    />
    <datalist id="client-suggestions">
      <option
        v-for="clientName in existingClientNames"
        :key="clientName"
        :value="clientName"
      />
    </datalist>
    <p v-if="saveError" class="mt-3 text-sm text-red-600">{{ saveError }}</p>
  </div>
</template>

<script setup lang="ts">
import AdminClientTable from '~/components/features/admin/AdminClientTable.vue'
import AdminHeader from '~/components/features/admin/AdminHeader.vue'
import type { ClientRow, ClientStatus, ServiceManagementMode, ServiceKey } from '~/components/features/admin/types'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

defineRouteRules({
  ssr: false,
})

const router = useRouter()

const statusTone: Record<ClientStatus, 'success' | 'info' | 'neutral'> = {
  Active: 'success',
  New: 'info',
  Closed: 'neutral',
}

const clients = ref<ClientRow[]>([])
const saveError = ref('')

const createRowId = () => `client-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const today = () => new Date().toISOString().slice(0, 10)

const getProjectSlugFromUrl = (siteUrl: string) => {
  try {
    const hostname = new URL(siteUrl).hostname.replace(/^www\./, '')
    return hostname.replace(/\./g, '-')
  } catch {
    return siteUrl
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .replace(/\./g, '-')
  }
}

const mapClientFromApi = (client: any): ClientRow => ({
  id: String(client.id),
  selected: false,
  name: String(client.site_name ?? ''),
  slug: String(client.slug ?? ''),
  siteUrl: String(client.site_url ?? ''),
  status: client.active ? 'Active' : 'Closed',
  createdAt: String(client.created_at ?? '').slice(0, 10) || today(),
  isClientEditing: false,
  isProjectEditing: false,
  clientInput: String(client.site_name ?? ''),
  projectInput: String(client.site_url ?? ''),
  services: Array.isArray(client.services)
    ? client.services.map((service: any) => ({
      key: service.key,
      configured: Boolean(service.configured),
      connected: Boolean(service.connected),
      managementMode: service.managementMode === 'admin_managed' ? 'admin_managed' : 'client_self_service',
    }))
    : [],
})

const existingClientNames = computed(() =>
  [...new Set(clients.value.map(client => client.name).filter(Boolean))]
)

const handleAddClient = () => {
  saveError.value = ''
  clients.value.unshift({
    id: createRowId(),
    selected: false,
    name: '',
    slug: '',
    siteUrl: '',
    status: 'New',
    createdAt: today(),
    isClientEditing: true,
    isProjectEditing: true,
    clientInput: '',
    projectInput: '',
    services: [],
  })
}

const enableProjectEdit = (client: ClientRow) => {
  client.isProjectEditing = true
  client.projectInput = client.siteUrl
}

const saveProject = async (client: ClientRow) => {
  saveError.value = ''
  const clientName = client.clientInput.trim()
  const projectUrl = client.projectInput.trim()

  if (!clientName || !projectUrl) {
    saveError.value = 'Client and project URL are required'
    return
  }

  try {
    const response = await $fetch('/api/admin/projects', {
      method: 'POST',
      body: {
        clientName,
        siteUrl: projectUrl,
      },
    })

    const savedClient = mapClientFromApi((response as any).client)
    Object.assign(client, {
      ...savedClient,
      status: client.status === 'New' ? 'New' : savedClient.status,
      isClientEditing: false,
      isProjectEditing: false,
      clientInput: savedClient.name,
      projectInput: savedClient.siteUrl,
    })
  } catch (error: any) {
    saveError.value = error?.data?.statusMessage || 'Failed to save project URL'
  }
}

const handleProjectClick = async (event: MouseEvent, client: ClientRow) => {
  if (event.shiftKey) {
    return
  }

  event.preventDefault()
  const clientSlug = client.slug || client.clientInput.toLowerCase().replace(/[^a-z0-9]+/g, '')
  const projectSlug = getProjectSlugFromUrl(client.siteUrl || client.projectInput)
  if (!clientSlug || !projectSlug) {
    saveError.value = 'Client slug or project slug is missing'
    return
  }

  // Use full navigation to avoid edge cases with anchor default behavior.
  window.location.href = `/dashboard/${clientSlug}/${projectSlug}`
}

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await router.push('/login')
}

const updateServiceMode = async (
  client: ClientRow,
  payload: { service: ServiceKey; managementMode: ServiceManagementMode }
) => {
  saveError.value = ''
  try {
    await $fetch(`/api/admin/clients/${client.id}/services`, {
      method: 'PUT',
      body: payload,
    })
    client.services = client.services.map((item) =>
      item.key === payload.service
        ? { ...item, managementMode: payload.managementMode }
        : item
    )
  } catch (error: any) {
    saveError.value = error?.data?.statusMessage || 'Failed to update service mode'
  }
}

onMounted(async () => {
  try {
    const data = await $fetch('/api/admin/clients')
    clients.value = (data as any[]).map(mapClientFromApi)
  } catch {
    // Keep UI interactive even if initial load fails.
    clients.value = []
  }
})
</script>
