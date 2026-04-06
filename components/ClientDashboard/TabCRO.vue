<template>
  <div class="space-y-6">
    <!-- Color legend -->
    <div class="flex flex-wrap gap-4 pb-6 border-b border-gray-200 dark:border-gray-700">
      <div v-for="color in colorLegend" :key="color.name" class="flex items-center gap-2">
        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: color.value }"></div>
        <span class="text-sm text-gray-700 dark:text-gray-300">{{ color.name }}</span>
      </div>
    </div>

    <!-- Persona filter buttons -->
    <div class="flex flex-wrap gap-2 pb-6">
      <button
        @click="selectedPersona = null"
        :class="[
          selectedPersona === null
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
          'px-4 py-2 rounded-md text-sm font-medium transition-colors',
        ]"
      >
        All Pages
      </button>
      <button
        v-for="persona in personas"
        :key="persona"
        @click="selectedPersona = persona"
        :class="[
          selectedPersona === persona
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600',
          'px-4 py-2 rounded-md text-sm font-medium transition-colors',
        ]"
      >
        {{ persona }}
      </button>
    </div>

    <!-- Pages grid -->
    <div class="grid auto-fill gap-4" style="grid-template-columns: repeat(auto-fill, minmax(195px, 1fr))">
      <div
        v-for="page in filteredPages"
        :key="page.id"
        @click="selectPage(page)"
        :class="[
          selectedPage?.id === page.id
            ? 'ring-2 ring-blue-500 border-blue-600'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
          'bg-white dark:bg-gray-800 border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md',
        ]"
      >
        <div class="space-y-2">
          <h3 class="font-semibold text-gray-900 dark:text-white truncate">{{ page.name }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{{ page.description }}</p>
          <div v-if="page.tags" class="flex flex-wrap gap-1 pt-2">
            <span
              v-for="tag in page.tags"
              :key="tag"
              class="inline-block px-2 py-1 rounded text-xs font-medium text-white"
              :style="{ backgroundColor: tagColors[tag] || '#999999' }"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail panel -->
    <div v-if="selectedPage" class="mt-8 pt-8 border-t-2 border-gray-200 dark:border-gray-700">
      <div class="space-y-4">
        <div class="flex justify-between items-start">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">{{ selectedPage.name }}</h2>
          <button
            @click="selectedPage = null"
            class="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Close detail
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">CRO Strategy</h3>
            <p class="text-gray-700 dark:text-gray-300">{{ selectedPage.croStrategy || 'N/A' }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">SEO Focus</h3>
            <p class="text-gray-700 dark:text-gray-300">{{ selectedPage.seoFocus || 'N/A' }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Keywords</h3>
            <p class="text-gray-700 dark:text-gray-300">{{ selectedPage.keywords || 'N/A' }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Schema</h3>
            <p class="text-gray-700 dark:text-gray-300">{{ selectedPage.schema || 'N/A' }}</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">CTAs</h3>
            <p class="text-gray-700 dark:text-gray-300">{{ selectedPage.ctas || 'N/A' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Page {
  id: string
  name: string
  description: string
  tags?: string[]
  croStrategy?: string
  seoFocus?: string
  keywords?: string
  schema?: string
  ctas?: string
  persona?: string
}

defineProps<{
  pages: Page[]
}>()

const colorLegend = [
  { name: 'Lead gen', value: '#1D9E75' },
  { name: 'Trust', value: '#534AB7' },
  { name: 'SEO', value: '#EF9F27' },
  { name: 'Urgent', value: '#D85A30' },
  { name: 'Support', value: '#185FA5' },
]

const tagColors: Record<string, string> = {
  'Lead gen': '#1D9E75',
  'Trust': '#534AB7',
  'SEO': '#EF9F27',
  'Urgent': '#D85A30',
  'Support': '#185FA5',
}

const personas = ['Price-conscious researcher', 'Trust-seeker', 'Urgent need']
const selectedPersona = ref<string | null>(null)
const selectedPage = ref<Page | null>(null)

const filteredPages = computed(() => {
  if (!selectedPersona.value) return props.pages
  return props.pages.filter((page) => page.persona === selectedPersona.value)
})

const selectPage = (page: Page) => {
  if (selectedPage.value?.id === page.id) {
    selectedPage.value = null
  } else {
    selectedPage.value = page
    // Smooth scroll to detail panel
    setTimeout(() => {
      document.querySelector('.mt-8')?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
