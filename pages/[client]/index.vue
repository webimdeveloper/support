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
const pages = ref<any[]>([
  {
    id: '1',
    name: 'Homepage',
    description: 'Main landing page with hero section',
    tags: ['Lead gen', 'SEO'],
    persona: null,
    croStrategy: 'Focus on CTAs above fold with clear contact form',
    seoFocus: 'Home, Main Keywords',
    keywords: 'Service, Solution, Provider',
    schema: 'Organization',
    ctas: 'Contact, Learn More',
  },
  {
    id: '2',
    name: 'Services Page',
    description: 'Detailed services and offerings',
    tags: ['Trust', 'SEO'],
    persona: 'Trust-seeker',
    croStrategy: 'Add testimonials and social proof',
    seoFocus: 'Service Pages',
    keywords: 'Services, Solutions',
    schema: 'LocalBusiness',
    ctas: 'Request Demo, Book Consultation',
  },
  {
    id: '3',
    name: 'Pricing Page',
    description: 'Pricing plans and options',
    tags: ['Urgent', 'Lead gen'],
    persona: 'Price-conscious researcher',
    croStrategy: 'Simplify pricing tables, add FAQ',
    seoFocus: 'Pricing',
    keywords: 'Price, Cost, Plans',
    schema: 'Product',
    ctas: 'Get Started, Free Trial',
  },
  {
    id: '4',
    name: 'Contact Page',
    description: 'Contact form and support info',
    tags: ['Support', 'Urgent'],
    persona: 'Urgent need',
    croStrategy: 'Multiple contact methods visible',
    seoFocus: 'Contact',
    keywords: 'Contact, Support',
    schema: 'ContactPoint',
    ctas: 'Send Message, Call Now',
  },
  {
    id: '5',
    name: 'Blog Main',
    description: 'Blog listing and featured posts',
    tags: ['SEO', 'Trust'],
    persona: null,
    croStrategy: 'Highlight top articles with CTAs',
    seoFocus: 'Blog, Content Hub',
    keywords: 'Blog, Articles, Insights',
    schema: 'BlogPosting',
    ctas: 'Read More, Subscribe',
  },
  {
    id: '6',
    name: 'About Us',
    description: 'Company information and team',
    tags: ['Trust'],
    persona: 'Trust-seeker',
    croStrategy: 'Highlight credentials and team member bios',
    seoFocus: 'About Page Brand',
    keywords: 'About, Team, Company',
    schema: 'Organization',
    ctas: 'Learn More, Connect',
  },
])

onMounted(async () => {
  // Load client data
  clientData.value = {
    slug: slug,
    site_name: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Client`,
  }
})

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await router.push('/')
}
</script>
