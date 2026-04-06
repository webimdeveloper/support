<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <!-- Header -->
    <div class="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ clientData?.site_name || 'Dashboard' }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Welcome to your support portal</p>
        </div>
        <button
          @click="handleLogout"
          class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Logout
        </button>
      </div>
    </div>

    <!-- Tabs -->
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

    <!-- Tab content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- CRO Tab -->
      <div v-if="activeTab === 'CRO'" class="space-y-6">
        <ClientDashboardTabCRO :pages="pages" />
      </div>

      <!-- Placeholder tabs -->
      <div v-else class="text-center py-12">
        <p class="text-gray-500 dark:text-gray-400 text-lg">{{ activeTab }} tab - Coming soon</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const slug = route.params.client as string

const activeTab = ref('CRO')
const tabs = ['CRO', 'Site Health', 'Assets', 'Reports']
const clientData = ref<any>(null)
const pages = ref<any[]>([])

onMounted(async () => {
  // TODO: Verify session slug matches route param
  // TODO: Fetch client data from Supabase
  // TODO: Load CRO data
})

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await router.push('/')
}
</script>
