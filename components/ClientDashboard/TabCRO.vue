<template>
  <div class="space-y-5">
    <div class="pb-5 border-b border-gray-200 dark:border-gray-700 space-y-4">
      <div class="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/70 px-2.5 py-2 dark:border-gray-700 dark:bg-gray-800/40">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Segments:</span>
        <button
          v-for="item in pageTypesLocal"
          :key="item.id"
          class="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs transition-colors justify-start cursor-grab active:cursor-grabbing"
          :title="`Command + drag to attach '${item.label}'`"
          :class="selectedPageTypeIds.includes(item.id) ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-300'"
          draggable="true"
          @mousedown="onTypeMouseDown($event, 'segment', item.id)"
          @dragstart.prevent
          @dragend.prevent
          @click="onSegmentChipClick($event, item.id)"
        >
          <span
            role="button"
            tabindex="0"
            class="color-edit-trigger w-3 h-3 rounded-full flex-shrink-0 transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-blue-400"
            :style="{ backgroundColor: item.color }"
            :title="`Change color for ${item.label}`"
            @click.stop="openColorPicker($event, 'segment', item.id)"
            @keydown.enter.prevent.stop="openColorPicker($event as any, 'segment', item.id)"
          />
          <span v-if="editingLegend?.kind === 'segment' && editingLegend?.id === item.id" class="w-full">
            <input
              v-model="editingLegendValue"
              class="w-full bg-transparent border-0 p-0 text-xs focus:outline-none"
              @keydown.enter.prevent="commitLegendEdit"
              @blur="commitLegendEdit"
            />
          </span>
          <span v-else class="truncate" @dblclick.stop="beginLegendEdit('segment', item.id, item.label)">{{ item.label }}</span>
          <span class="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200">{{ segmentCount(item.id) }}</span>
        </button>
        <button
          v-if="isAdmin"
          class="inline-flex items-center justify-center w-7 h-7 rounded-full border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50"
          @click="addPageType"
          title="Add segment"
        >
          <UIcon name="i-lucide-plus" class="w-4 h-4" />
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/70 px-2.5 py-2 dark:border-gray-700 dark:bg-gray-800/40">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">User Type:</span>
        <button
          v-for="item in userTypesLocal"
          :key="item.id"
          class="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs transition-colors justify-start cursor-grab active:cursor-grabbing"
          :title="`Command + drag to attach '${item.label}'`"
          :class="selectedUserTypeIds.includes(item.id) ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-300'"
          draggable="true"
          @mousedown="onTypeMouseDown($event, 'user', item.id)"
          @dragstart.prevent
          @dragend.prevent
          @click="onUserTypeChipClick($event, item.id)"
        >
          <span
            role="button"
            tabindex="0"
            class="color-edit-trigger w-3 h-3 rounded-full flex-shrink-0 transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-blue-400"
            :style="{ backgroundColor: item.color }"
            :title="`Change color for ${item.label}`"
            @click.stop="openColorPicker($event, 'user', item.id)"
            @keydown.enter.prevent.stop="openColorPicker($event as any, 'user', item.id)"
          />
          <span v-if="editingLegend?.kind === 'user' && editingLegend?.id === item.id" class="w-full">
            <input
              v-model="editingLegendValue"
              class="w-full bg-transparent border-0 p-0 text-xs focus:outline-none"
              @keydown.enter.prevent="commitLegendEdit"
              @blur="commitLegendEdit"
            />
          </span>
          <span v-else class="truncate" @dblclick.stop="beginLegendEdit('user', item.id, item.label)">{{ item.label }}</span>
          <span class="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200">{{ userCount(item.id) }}</span>
        </button>
        <button
          v-if="isAdmin"
          class="inline-flex items-center justify-center w-7 h-7 rounded-full border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50"
          @click="addUserType"
          title="Add user type"
        >
          <UIcon name="i-lucide-plus" class="w-4 h-4" />
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/70 px-2.5 py-2 dark:border-gray-700 dark:bg-gray-800/40">
        <span class="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2">Funnel Stage:</span>
        <button
          v-for="item in funnelStagesLocal"
          :key="item.id"
          class="inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs transition-colors justify-start cursor-grab active:cursor-grabbing"
          :title="`Command + drag to attach '${item.label}'`"
          :class="selectedFunnelStageIds.includes(item.id) ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-300'"
          draggable="true"
          @mousedown="onTypeMouseDown($event, 'funnel', item.id)"
          @dragstart.prevent
          @dragend.prevent
          @click="onFunnelChipClick($event, item.id)"
        >
          <span
            role="button"
            tabindex="0"
            class="color-edit-trigger w-3 h-3 rounded-full flex-shrink-0 transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-blue-400"
            :style="{ backgroundColor: item.color }"
            :title="`Change color for ${item.label}`"
            @click.stop="openColorPicker($event, 'funnel', item.id)"
            @keydown.enter.prevent.stop="openColorPicker($event as any, 'funnel', item.id)"
          />
          <span v-if="editingLegend?.kind === 'funnel' && editingLegend?.id === item.id" class="w-full">
            <input
              v-model="editingLegendValue"
              class="w-full bg-transparent border-0 p-0 text-xs focus:outline-none"
              @keydown.enter.prevent="commitLegendEdit"
              @blur="commitLegendEdit"
            />
          </span>
          <span v-else class="truncate" @dblclick.stop="beginLegendEdit('funnel', item.id, item.label)">{{ item.label }}</span>
          <span class="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-200">{{ funnelCount(item.id) }}</span>
        </button>
        <button
          v-if="isAdmin"
          class="inline-flex items-center justify-center w-7 h-7 rounded-full border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50"
          @click="addFunnelStage"
          title="Add funnel stage"
        >
          <UIcon name="i-lucide-plus" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div class="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
      {{ filteredPagesLocal.length === pagesLocal.length ? `All pages - ${pagesLocal.length} total` : `${filteredPagesLocal.length} pages` }}
    </div>
    <div
      v-if="colorPickerState"
      class="color-popover fixed z-50 w-44 rounded-lg border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
      :style="{ left: `${colorPickerPosition.x}px`, top: `${colorPickerPosition.y}px` }"
    >
      <div class="grid grid-cols-6 gap-1">
        <button
          v-for="swatch in colorSwatches"
          :key="swatch"
          type="button"
          class="h-5 w-5 rounded border border-gray-200 dark:border-gray-600 transition-transform hover:scale-110"
          :style="{ backgroundColor: swatch }"
          @click="setColor(swatch)"
        />
      </div>
      <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <input
          type="color"
          class="h-7 w-full border-0 bg-transparent p-0"
          :value="currentPickerColor"
          @input="setColor(($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <div class="grid gap-2.5" style="grid-template-columns: repeat(auto-fill, minmax(195px, 1fr))">
      <div
        v-if="isAdmin"
        @click="addPage"
        class="border border-dashed border-gray-300 rounded-xl p-3.5 cursor-pointer transition-all select-none bg-white dark:bg-gray-900 hover:border-blue-400"
      >
        <div class="font-medium text-sm text-gray-900 dark:text-white mb-2 leading-snug">Add Page to Track</div>
        <div class="text-3xl leading-none text-blue-600">+</div>
      </div>

      <div
        v-for="page in filteredPagesLocal"
        :key="page.id"
        @click="togglePage(page)"
        @mouseenter="onPageMouseEnter(page.id)"
        @mouseleave="onPageMouseLeave(page.id)"
        @mouseup="onPageMouseUp(page)"
        :class="[
          selectedPage?.id === page.id
            ? 'border-blue-500 dark:border-blue-400'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800',
          dragOverPageId === page.id ? 'ring-2 ring-blue-400 border-blue-400 bg-blue-50/40 dark:bg-blue-950/20' : '',
          'border rounded-xl p-3.5 cursor-pointer transition-all select-none bg-white dark:bg-gray-900',
        ]"
      >
        <div class="font-medium text-sm text-gray-900 dark:text-white mb-2 leading-snug">
          <template v-if="isAdmin && isEditingField(page.id, 'name')">
            <input
              v-model="editingFieldValue"
              class="w-full border rounded px-2 py-1 text-sm"
              @keydown.enter.prevent="commitPageFieldEdit"
              @blur="commitPageFieldEdit"
            />
          </template>
          <span v-else @dblclick.stop="startEditingField(page.id, 'name')">{{ page.name || 'Add content...' }}</span>
        </div>

        <div class="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          <template v-if="isAdmin && isEditingField(page.id, 'goal')">
            <textarea
              v-model="editingFieldValue"
              class="w-full border rounded px-2 py-1 text-xs"
              @keydown.enter.prevent="commitPageFieldEdit"
              @blur="commitPageFieldEdit"
            />
          </template>
          <span v-else @dblclick.stop="startEditingField(page.id, 'goal')">{{ page.goal || 'Add content...' }}</span>
        </div>

        <div class="mt-2.5 flex items-center gap-1 flex-wrap">
          <span
            v-for="typeId in page.pageTypeIds"
            :key="`p-${page.id}-${typeId}`"
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: currentPageType(typeId)?.color }"
            :title="segmentLabel(typeId)"
          />
          <span class="text-[10px] text-gray-400 mx-0.5">|</span>
          <span
            v-for="typeId in page.userTypeIds"
            :key="`u-${page.id}-${typeId}`"
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: currentUserType(typeId)?.color }"
            :title="userTypeLabel(typeId)"
          />
          <span class="text-[10px] text-gray-400 mx-0.5">|</span>
          <span
            v-for="typeId in page.funnelStageIds"
            :key="`f-${page.id}-${typeId}`"
            class="w-3 h-3 rounded-full"
            :style="{ backgroundColor: currentFunnelStage(typeId)?.color }"
            :title="funnelStageLabel(typeId)"
          />
        </div>
      </div>
    </div>

    <div v-if="selectedPage" class="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900">
      <div class="flex flex-wrap items-center gap-2.5 mb-5">
        <span class="text-base font-medium text-gray-900 dark:text-white">{{ selectedPage.name || 'Add content...' }}</span>
        <code class="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">{{ selectedPage.url }}</code>
      </div>

      <div class="mb-4 space-y-2" v-if="isAdmin">
        <div class="text-xs font-semibold text-gray-500 uppercase">Segments:</div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in pageTypesLocal"
            :key="`details-page-${item.id}`"
            class="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
            :class="selectedPage.pageTypeIds.includes(item.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'"
            @click="togglePageTypeOnPage(selectedPage, item.id)"
          >
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
            {{ item.label }}
          </button>
        </div>

        <div class="text-xs font-semibold text-gray-500 uppercase mt-2">User Type:</div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in userTypesLocal"
            :key="`details-user-${item.id}`"
            class="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
            :class="selectedPage.userTypeIds.includes(item.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'"
            @click="togglePageUserType(selectedPage, item.id)"
          >
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
            {{ item.label }}
          </button>
        </div>

        <div class="text-xs font-semibold text-gray-500 uppercase mt-2">Funnel Stage:</div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in funnelStagesLocal"
            :key="`details-funnel-${item.id}`"
            class="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs"
            :class="selectedPage.funnelStageIds.includes(item.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'"
            @click="toggleFunnelStageOnPage(selectedPage, item.id)"
          >
            <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
            {{ item.label }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-7 gap-y-0">
        <div>
          <div class="detail-label">CRO Strategy</div>
          <textarea v-if="isAdmin" v-model="selectedPage.cro" class="w-full border rounded px-2 py-1 text-sm min-h-24" />
          <p v-else class="detail-body">{{ selectedPage.cro }}</p>
        </div>
        <div>
          <div class="detail-label">SEO Focus</div>
          <textarea v-if="isAdmin" v-model="selectedPage.seo" class="w-full border rounded px-2 py-1 text-sm min-h-24" />
          <p v-else class="detail-body">{{ selectedPage.seo }}</p>
          <div class="detail-label mt-4">Target Keywords</div>
          <div v-for="(kw, idx) in selectedPage.kw" :key="`${kw}-${idx}`" class="text-xs text-gray-500 dark:text-gray-400 leading-loose flex items-center gap-2">
            <span>•</span>
            <input v-if="isAdmin" v-model="selectedPage.kw[idx]" class="border rounded px-2 py-0.5 text-xs" @blur="normalizeKeyword(idx)" @keydown.enter.prevent="normalizeKeyword(idx)" />
            <span v-else>{{ kw }}</span>
            <button v-if="isAdmin" @click="selectedPage.kw.splice(idx, 1)" class="text-red-600 text-xs">Delete</button>
          </div>
          <button v-if="isAdmin" @click="selectedPage.kw.push('new keyword')" class="mt-1 text-xs underline text-blue-600">+ Add keyword</button>
        </div>
      </div>

      <div class="flex items-center gap-3 mt-5">
        <button v-if="isAdmin" @click="emitSave" class="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded">Save changes</button>
        <button v-if="isAdmin" @click="deleteSelectedPage" class="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded">Delete page</button>
        <button @click="selectedPage = null" class="mt-5 text-xs text-gray-400 hover:text-gray-500 underline">Close detail</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface PageType {
  id: string
  label: string
  color: string
  bgColor: string
}

export interface UserType {
  id: string
  label: string
  color: string
}

export interface FunnelStage {
  id: string
  label: string
  color: string
}

export interface Page {
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

const props = defineProps<{
  pages: Page[]
  pageTypes: PageType[]
  userTypes: UserType[]
  funnelStages: FunnelStage[]
  isAdmin?: boolean
}>()

const emit = defineEmits<{
  (e: 'save', payload: { pageTypes: PageType[]; userTypes: UserType[]; funnelStages: FunnelStage[]; pages: Page[] }): void
}>()

const safeClone = <T>(value: T): T => JSON.parse(JSON.stringify(value))
const pageTypesLocal = ref<PageType[]>(safeClone(props.pageTypes || []))
const userTypesLocal = ref<UserType[]>(safeClone(props.userTypes || []))
const funnelStagesLocal = ref<FunnelStage[]>(safeClone(props.funnelStages || []))
const pagesLocal = ref<Page[]>(safeClone(props.pages || []))

const selectedPageTypeIds = ref<string[]>([])
const selectedUserTypeIds = ref<string[]>([])
const selectedFunnelStageIds = ref<string[]>([])
const selectedPage = ref<Page | null>(null)
const editingField = ref<{ pageId: number; field: 'name' | 'goal' } | null>(null)
const editingFieldValue = ref('')
const editingLegend = ref<{ kind: 'segment' | 'user' | 'funnel'; id: string } | null>(null)
const editingLegendValue = ref('')
const colorPickerState = ref<{ kind: 'segment' | 'user' | 'funnel'; id: string } | null>(null)
const colorPickerPosition = ref({ x: 0, y: 0 })
const colorSwatches = ['#0F6E56', '#534AB7', '#854F0B', '#993C1D', '#185FA5', '#1D9E75', '#7F77DD', '#D85A30', '#2563EB', '#7C3AED', '#EA580C', '#4B5563']
let autosaveTimer: ReturnType<typeof setTimeout> | null = null
const randomLegendColor = () => colorSwatches[Math.floor(Math.random() * colorSwatches.length)]

const emitSave = () => {
  emit('save', {
    pageTypes: pageTypesLocal.value,
    userTypes: userTypesLocal.value,
    funnelStages: funnelStagesLocal.value,
    pages: pagesLocal.value,
  })
}

const queueAutosave = () => {
  if (!props.isAdmin) return
  if (autosaveTimer) clearTimeout(autosaveTimer)
  autosaveTimer = setTimeout(() => {
    emitSave()
  }, 250)
}

watch(() => props.pages, (val) => { pagesLocal.value = safeClone(val || []) }, { deep: true })
watch(() => props.pageTypes, (val) => { pageTypesLocal.value = safeClone(val || []) }, { deep: true })
watch(() => props.userTypes, (val) => { userTypesLocal.value = safeClone(val || []) }, { deep: true })
watch(() => props.funnelStages, (val) => { funnelStagesLocal.value = safeClone(val || []) }, { deep: true })

const currentPageType = (id: string) => pageTypesLocal.value.find((p) => p.id === id)
const currentUserType = (id: string) => userTypesLocal.value.find((u) => u.id === id)
const currentFunnelStage = (id: string) => funnelStagesLocal.value.find((f) => f.id === id)
const segmentLabel = (id: string) => currentPageType(id)?.label || 'Unknown segment'
const userTypeLabel = (id: string) => currentUserType(id)?.label || 'Unknown user type'
const funnelStageLabel = (id: string) => currentFunnelStage(id)?.label || 'Unknown funnel stage'
const currentPickerColor = computed(() => {
  if (!colorPickerState.value) return '#000000'
  if (colorPickerState.value.kind === 'segment') return currentPageType(colorPickerState.value.id)?.color || '#000000'
  if (colorPickerState.value.kind === 'user') return currentUserType(colorPickerState.value.id)?.color || '#000000'
  return currentFunnelStage(colorPickerState.value.id)?.color || '#000000'
})

const filteredPagesLocal = computed(() =>
  pagesLocal.value.filter((p) => {
    const matchesSegment = selectedPageTypeIds.value.length === 0 || selectedPageTypeIds.value.some((id) => p.pageTypeIds.includes(id))
    const matchesUser = selectedUserTypeIds.value.length === 0 || selectedUserTypeIds.value.some((id) => p.userTypeIds.includes(id))
    const matchesFunnel = selectedFunnelStageIds.value.length === 0 || selectedFunnelStageIds.value.some((id) => p.funnelStageIds.includes(id))
    return matchesSegment && matchesUser && matchesFunnel
  })
)

const pagesMatchingWithoutSegment = computed(() =>
  pagesLocal.value.filter((p) => {
    const matchesUser = selectedUserTypeIds.value.length === 0 || selectedUserTypeIds.value.some((id) => p.userTypeIds.includes(id))
    const matchesFunnel = selectedFunnelStageIds.value.length === 0 || selectedFunnelStageIds.value.some((id) => p.funnelStageIds.includes(id))
    return matchesUser && matchesFunnel
  })
)

const pagesMatchingWithoutUser = computed(() =>
  pagesLocal.value.filter((p) => {
    const matchesSegment = selectedPageTypeIds.value.length === 0 || selectedPageTypeIds.value.some((id) => p.pageTypeIds.includes(id))
    const matchesFunnel = selectedFunnelStageIds.value.length === 0 || selectedFunnelStageIds.value.some((id) => p.funnelStageIds.includes(id))
    return matchesSegment && matchesFunnel
  })
)

const pagesMatchingWithoutFunnel = computed(() =>
  pagesLocal.value.filter((p) => {
    const matchesSegment = selectedPageTypeIds.value.length === 0 || selectedPageTypeIds.value.some((id) => p.pageTypeIds.includes(id))
    const matchesUser = selectedUserTypeIds.value.length === 0 || selectedUserTypeIds.value.some((id) => p.userTypeIds.includes(id))
    return matchesSegment && matchesUser
  })
)

const segmentCount = (id: string) => pagesMatchingWithoutSegment.value.filter((p) => p.pageTypeIds.includes(id)).length
const userCount = (id: string) => pagesMatchingWithoutUser.value.filter((p) => p.userTypeIds.includes(id)).length
const funnelCount = (id: string) => pagesMatchingWithoutFunnel.value.filter((p) => p.funnelStageIds.includes(id)).length

const toggleMulti = (arr: string[], id: string) => arr.includes(id) ? arr.filter((item) => item !== id) : [...arr, id]

const togglePageTypeFilter = (id: string) => {
  selectedPageTypeIds.value = toggleMulti(selectedPageTypeIds.value, id)
}

const toggleUserTypeFilter = (id: string) => {
  selectedUserTypeIds.value = toggleMulti(selectedUserTypeIds.value, id)
}

const toggleFunnelStageFilter = (id: string) => {
  selectedFunnelStageIds.value = toggleMulti(selectedFunnelStageIds.value, id)
}

const onSegmentChipClick = (event: MouseEvent, id: string) => {
  if (event.metaKey) return
  togglePageTypeFilter(id)
}

const onUserTypeChipClick = (event: MouseEvent, id: string) => {
  if (event.metaKey) return
  toggleUserTypeFilter(id)
}

const onFunnelChipClick = (event: MouseEvent, id: string) => {
  if (event.metaKey) return
  toggleFunnelStageFilter(id)
}

const openColorPicker = (event: MouseEvent, kind: 'segment' | 'user' | 'funnel', id: string) => {
  if (!props.isAdmin) return
  const target = event.currentTarget as HTMLElement | null
  if (target) {
    const rect = target.getBoundingClientRect()
    const popoverWidth = 176
    const x = Math.min(Math.max(8, rect.left + rect.width / 2 - popoverWidth / 2), window.innerWidth - popoverWidth - 8)
    const y = Math.max(8, rect.top - 90)
    colorPickerPosition.value = { x, y }
  }
  colorPickerState.value = { kind, id }
}

const closeColorPicker = () => {
  colorPickerState.value = null
}

const handleGlobalClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement | null
  if (!target) return
  if (target.closest('.color-popover')) return
  if (target.closest('.color-edit-trigger')) return
  closeColorPicker()
}

const setColor = (color: string) => {
  if (!colorPickerState.value) return
  if (colorPickerState.value.kind === 'segment') {
    const target = currentPageType(colorPickerState.value.id)
    if (target) target.color = color
    queueAutosave()
    return
  }
  if (colorPickerState.value.kind === 'user') {
    const target = currentUserType(colorPickerState.value.id)
    if (target) target.color = color
    queueAutosave()
    return
  }
  const target = currentFunnelStage(colorPickerState.value.id)
  if (target) target.color = color
  queueAutosave()
}

const startEditingField = (pageId: number, field: 'name' | 'goal') => {
  if (!props.isAdmin) return
  const page = pagesLocal.value.find((p) => p.id === pageId)
  if (!page) return
  editingFieldValue.value = String(page[field] || '')
  editingField.value = { pageId, field }
}

const isEditingField = (pageId: number, field: 'name' | 'goal') =>
  editingField.value?.pageId === pageId && editingField.value?.field === field

const commitPageFieldEdit = () => {
  if (!editingField.value) return
  const page = pagesLocal.value.find((p) => p.id === editingField.value?.pageId)
  if (!page) return

  const value = editingFieldValue.value.trim()
  if (!value) {
    pagesLocal.value = pagesLocal.value.filter((p) => p.id !== editingField.value?.pageId)
    if (selectedPage.value?.id === editingField.value?.pageId) selectedPage.value = null
  } else {
    page[editingField.value.field] = value
  }
  editingField.value = null
}

const beginLegendEdit = (kind: 'segment' | 'user' | 'funnel', id: string, value: string) => {
  if (!props.isAdmin) return
  editingLegend.value = { kind, id }
  editingLegendValue.value = value
}

const commitLegendEdit = () => {
  if (!editingLegend.value) return
  const value = editingLegendValue.value.trim()
  const target = editingLegend.value.kind === 'segment'
    ? pageTypesLocal.value
    : editingLegend.value.kind === 'user'
      ? userTypesLocal.value
      : funnelStagesLocal.value

  const index = target.findIndex((item) => item.id === editingLegend.value?.id)
  if (index < 0) {
    editingLegend.value = null
    return
  }

  if (!value) {
    const removedId = target[index].id
    target.splice(index, 1)
    pagesLocal.value.forEach((p) => {
      if (editingLegend.value?.kind === 'segment') p.pageTypeIds = p.pageTypeIds.filter((id) => id !== removedId)
      if (editingLegend.value?.kind === 'user') p.userTypeIds = p.userTypeIds.filter((id) => id !== removedId)
      if (editingLegend.value?.kind === 'funnel') p.funnelStageIds = p.funnelStageIds.filter((id) => id !== removedId)
    })
    selectedPageTypeIds.value = selectedPageTypeIds.value.filter((id) => id !== removedId)
    selectedUserTypeIds.value = selectedUserTypeIds.value.filter((id) => id !== removedId)
    selectedFunnelStageIds.value = selectedFunnelStageIds.value.filter((id) => id !== removedId)
  } else {
    target[index].label = value
  }
  editingLegend.value = null
  queueAutosave()
}

const addPageType = () => {
  pageTypesLocal.value.push({
    id: `segment-${Date.now()}`,
    label: 'New segment',
    color: randomLegendColor(),
    bgColor: '#E5E7EB',
  })
  queueAutosave()
}

const addUserType = () => {
  userTypesLocal.value.push({
    id: `user-type-${Date.now()}`,
    label: 'New user type',
    color: randomLegendColor(),
  })
  queueAutosave()
}

const addFunnelStage = () => {
  funnelStagesLocal.value.push({
    id: `funnel-${Date.now()}`,
    label: 'New funnel stage',
    color: randomLegendColor(),
  })
  queueAutosave()
}

const addPage = () => {
  const fallbackType = pageTypesLocal.value[0]?.id
  pagesLocal.value.unshift({
    id: Date.now(),
    name: 'Add content...',
    url: '/new-page',
    pageTypeIds: fallbackType ? [fallbackType] : [],
    userTypeIds: [],
    funnelStageIds: [],
    goal: 'Add content...',
    cro: 'Add content...',
    seo: 'Add content...',
    kw: [],
    schema: '',
    cta: '',
  })
}

const togglePageTypeOnPage = (page: Page, typeId: string) => {
  if (!props.isAdmin) return
  page.pageTypeIds = toggleMulti(page.pageTypeIds, typeId)
}

const togglePageUserType = (page: Page, userTypeId: string) => {
  if (!props.isAdmin) return
  page.userTypeIds = toggleMulti(page.userTypeIds, userTypeId)
}

const toggleFunnelStageOnPage = (page: Page, stageId: string) => {
  if (!props.isAdmin) return
  page.funnelStageIds = toggleMulti(page.funnelStageIds, stageId)
}

const deleteSelectedPage = () => {
  if (!props.isAdmin || !selectedPage.value) return
  pagesLocal.value = pagesLocal.value.filter((p) => p.id !== selectedPage.value?.id)
  selectedPage.value = null
}

const normalizeKeyword = (idx: number) => {
  if (!selectedPage.value) return
  const value = selectedPage.value.kw[idx]?.trim()
  if (!value) {
    selectedPage.value.kw.splice(idx, 1)
    return
  }
  selectedPage.value.kw[idx] = value
}

const dragPayload = ref<{ kind: 'segment' | 'user' | 'funnel'; id: string } | null>(null)
const dragOverPageId = ref<number | null>(null)
const isAttachDragActive = ref(false)
const commandArmedDrag = ref<{ kind: 'segment' | 'user' | 'funnel'; id: string } | null>(null)

const onTypeMouseDown = (event: MouseEvent, kind: 'segment' | 'user' | 'funnel', id: string) => {
  if (!props.isAdmin) return
  if (event.metaKey) {
    commandArmedDrag.value = { kind, id }
    isAttachDragActive.value = true
  } else {
    commandArmedDrag.value = null
    isAttachDragActive.value = false
  }
}

const clearAttachState = () => {
  dragPayload.value = null
  dragOverPageId.value = null
  isAttachDragActive.value = false
  commandArmedDrag.value = null
}

const onPageMouseEnter = (pageId: number) => {
  if (!props.isAdmin || !isAttachDragActive.value || !commandArmedDrag.value) return
  dragPayload.value = { ...commandArmedDrag.value }
  dragOverPageId.value = pageId
}

const onPageMouseLeave = (pageId: number) => {
  if (dragOverPageId.value === pageId) dragOverPageId.value = null
}

const onPageMouseUp = (page: Page) => {
  if (!props.isAdmin || !dragPayload.value) return
  if (dragPayload.value.kind === 'segment') togglePageTypeOnPage(page, dragPayload.value.id)
  if (dragPayload.value.kind === 'user') togglePageUserType(page, dragPayload.value.id)
  if (dragPayload.value.kind === 'funnel') toggleFunnelStageOnPage(page, dragPayload.value.id)
  clearAttachState()
}

const togglePage = (page: Page) => {
  if (selectedPage.value?.id === page.id) {
    selectedPage.value = null
  } else {
    selectedPage.value = page
  }
}

onMounted(() => {
  window.addEventListener('mouseup', clearAttachState)
  window.addEventListener('click', handleGlobalClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('mouseup', clearAttachState)
  window.removeEventListener('click', handleGlobalClick)
  if (autosaveTimer) clearTimeout(autosaveTimer)
})
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
