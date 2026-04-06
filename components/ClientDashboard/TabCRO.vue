<template>
  <div class="space-y-5">
    <!-- Legend -->
    <div class="flex flex-wrap gap-x-4 gap-y-2 pb-5 border-b border-gray-200 dark:border-gray-700">
      <div v-for="item in colorLegend" :key="item.name" class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full flex-shrink-0" :style="{ backgroundColor: item.color }"></div>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.name }}</span>
      </div>
      <div class="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
      <div v-for="item in personaLegend" :key="item.name" class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full flex-shrink-0 opacity-60" :style="{ backgroundColor: item.color }"></div>
        <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.name }}</span>
      </div>
    </div>

    <!-- Persona filter buttons -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="f in filters"
        :key="f.value"
        @click="activeFilter = f.value"
        :class="[
          activeFilter === f.value
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-400 dark:border-gray-500 font-medium'
            : 'text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700',
          'px-3.5 py-1 rounded-full border text-xs transition-colors',
        ]"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Section label -->
    <div class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
      {{ filteredPages.length === pages.length ? `All pages — ${pages.length} total` : `${filteredPages.length} pages` }}
    </div>

    <!-- Pages grid -->
    <div class="grid gap-2.5" style="grid-template-columns: repeat(auto-fill, minmax(195px, 1fr))">
      <div
        v-for="page in filteredPages"
        :key="page.id"
        @click="togglePage(page)"
        :class="[
          selectedPage?.id === page.id
            ? 'border-blue-500 dark:border-blue-400'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800',
          'border rounded-xl p-3.5 cursor-pointer transition-all select-none bg-white dark:bg-gray-900',
        ]"
        :style="selectedPage?.id === page.id ? { backgroundColor: page.tagBg + '44' } : {}"
      >
        <div class="font-medium text-sm text-gray-900 dark:text-white mb-2 leading-snug">{{ page.name }}</div>
        <span
          class="inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-2"
          :style="{ color: page.tagColor, backgroundColor: page.tagBg }"
        >{{ page.tag }}</span>
        <div class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{{ page.goal }}</div>
        <div class="flex gap-1 mt-2.5 flex-wrap">
          <div
            v-for="intent in page.intents"
            :key="intent"
            class="w-1.5 h-1.5 rounded-full"
            :title="intent"
            :style="{ backgroundColor: intentColor(intent) }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Detail panel -->
    <div
      v-if="selectedPage"
      class="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900"
    >
      <div class="flex flex-wrap items-center gap-2.5 mb-5">
        <span class="text-base font-medium text-gray-900 dark:text-white">{{ selectedPage.name }}</span>
        <span
          class="text-xs px-2 py-0.5 rounded-full font-medium"
          :style="{ color: selectedPage.tagColor, backgroundColor: selectedPage.tagBg }"
        >{{ selectedPage.tag }}</span>
        <code class="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{{ selectedPage.url }}</code>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-0">
        <div>
          <div class="detail-label">CRO Strategy</div>
          <p class="detail-body">{{ selectedPage.cro }}</p>
        </div>
        <div>
          <div class="detail-label">SEO Focus</div>
          <p class="detail-body">{{ selectedPage.seo }}</p>
          <div class="detail-label mt-4">Target Keywords</div>
          <div v-for="kw in selectedPage.kw" :key="kw" class="text-xs text-gray-500 dark:text-gray-400 leading-loose">• {{ kw }}</div>
        </div>
        <div>
          <div class="detail-label mt-4">Schema Markup</div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="s in selectedPage.schema.split(',')"
              :key="s"
              class="text-xs px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
            >{{ s.trim() }}</span>
          </div>
        </div>
        <div>
          <div class="detail-label mt-4">Primary CTAs</div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="c in selectedPage.cta.split(',')"
              :key="c"
              class="text-xs px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950"
            >{{ c.trim() }}</span>
          </div>
        </div>
      </div>

      <button
        @click="selectedPage = null"
        class="mt-5 text-xs text-gray-400 hover:text-gray-500 underline"
      >Close detail</button>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Page {
  id: number
  name: string
  url: string
  tag: string
  tagColor: string
  tagBg: string
  intents: string[]
  goal: string
  cro: string
  seo: string
  kw: string[]
  schema: string
  cta: string
}

const props = defineProps<{ pages: Page[] }>()

const colorLegend = [
  { name: 'Lead gen',           color: '#1D9E75' },
  { name: 'Trust / authority',  color: '#7F77DD' },
  { name: 'SEO / education',    color: '#EF9F27' },
  { name: 'Urgent conversion',  color: '#D85A30' },
  { name: 'Support / retention',color: '#378ADD' },
]

const personaLegend = [
  { name: 'Researcher persona',   color: '#1D9E75' },
  { name: 'Trust-seeker persona', color: '#7F77DD' },
  { name: 'Urgent need persona',  color: '#D85A30' },
]

const filters = [
  { value: 'all',         label: 'All pages' },
  { value: 'researcher',  label: 'Price-conscious researcher' },
  { value: 'trustseeker', label: 'Trust-seeker' },
  { value: 'urgent',      label: 'Urgent need' },
]

const intentColor = (intent: string) => {
  if (intent === 'researcher')  return '#1D9E75'
  if (intent === 'trustseeker') return '#7F77DD'
  return '#D85A30'
}

const activeFilter  = ref('all')
const selectedPage  = ref<Page | null>(null)

const filteredPages = computed(() =>
  activeFilter.value === 'all'
    ? props.pages
    : props.pages.filter(p => p.intents.includes(activeFilter.value))
)

const togglePage = (page: Page) => {
  if (selectedPage.value?.id === page.id) {
    selectedPage.value = null
  } else {
    selectedPage.value = page
    setTimeout(() => {
      document.querySelector('.border.border-gray-200.rounded-xl.p-6')
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 50)
  }
}
</script>

<style scoped>
.detail-label {
  font-size: 10px;
  font-weight: 500;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}
.detail-body {
  font-size: 13px;
  line-height: 1.65;
  color: inherit;
}
</style>
