<template>
  <div class="min-h-screen bg-white dark:bg-gray-950 text-[var(--color-text)]">
    <!-- Nav -->
    <header
      class="sticky top-0 z-[100] border-b bg-white/95 backdrop-blur dark:bg-gray-950/95 dark:border-gray-800"
      style="border-color: var(--border-default)"
    >
      <div class="mx-auto flex h-[60px] max-w-[1100px] items-center justify-between px-5 md:px-10">
        <NuxtLink to="/" class="flex items-center gap-2.5 no-underline">
          <span
            class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#111] text-white dark:bg-white dark:text-[#111]"
            aria-hidden="true"
          >
            <svg class="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
              <rect x="2" y="2" width="7" height="7" rx="1.5" />
              <rect x="11" y="2" width="7" height="7" rx="1.5" opacity=".85" />
              <rect x="2" y="11" width="7" height="7" rx="1.5" opacity=".85" />
              <rect x="11" y="11" width="7" height="7" rx="1.5" opacity=".35" />
            </svg>
          </span>
          <span class="leading-tight">
            <span class="block text-sm font-semibold tracking-tight text-[#111] dark:text-white">Widev Pro</span>
            <span class="block text-[10px] tracking-wide text-gray-500 dark:text-gray-400">clients portal</span>
          </span>
        </NuxtLink>
        <nav class="hidden items-center gap-7 text-[13px] md:flex" aria-label="Primary">
          <NuxtLink to="/about" class="text-gray-600 no-underline hover:text-[#111] dark:text-gray-400 dark:hover:text-white">
            About
          </NuxtLink>
          <NuxtLink to="/privacy" class="text-gray-600 no-underline hover:text-[#111] dark:text-gray-400 dark:hover:text-white">
            Privacy
          </NuxtLink>
          <NuxtLink to="/terms" class="text-gray-600 no-underline hover:text-[#111] dark:text-gray-400 dark:hover:text-white">
            Terms
          </NuxtLink>
          <NuxtLink to="/contact" class="text-gray-600 no-underline hover:text-[#111] dark:text-gray-400 dark:hover:text-white">
            Contact
          </NuxtLink>
        </nav>
        <NuxtLink
          to="/login"
          class="rounded-lg bg-[#111] px-5 py-2 text-[13px] font-medium text-white no-underline hover:opacity-90 dark:bg-white dark:text-[#111]"
        >
          Login
        </NuxtLink>
      </div>
    </header>

    <!-- Hero -->
    <section class="mx-auto grid max-w-[1100px] gap-10 px-5 py-12 md:grid-cols-2 md:gap-12 md:px-10 md:py-20">
      <div>
        <p
          class="mb-5 inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300"
        >
          <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          Your reliable web assistant
        </p>
        <h1 class="mb-4 text-3xl font-bold leading-[1.15] tracking-tight text-[#111] md:text-[42px] dark:text-white">
          Your clients' portal.<br />
          <span class="font-bold text-indigo-600 dark:text-indigo-400">Everything in one place.</span>
        </h1>
        <p class="mb-6 max-w-[420px] text-base leading-relaxed text-gray-600 dark:text-gray-400">
          Connect analytics, get verified insights, track performance, submit tickets, manage apps — all from one private
          dashboard built for your business.
        </p>
        <div class="mb-7 flex flex-wrap gap-2">
          <span
            v-for="pill in heroPills"
            :key="pill"
            class="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            {{ pill }}
          </span>
        </div>
        <div class="flex flex-wrap gap-2.5">
          <NuxtLink
            to="/login"
            class="rounded-[10px] bg-[#111] px-6 py-3 text-sm font-medium text-white no-underline hover:opacity-90 dark:bg-white dark:text-[#111]"
          >
            Login to portal
          </NuxtLink>
          <NuxtLink
            to="/about"
            class="rounded-[10px] border border-gray-300 px-6 py-3 text-sm font-medium text-[#111] no-underline hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
          >
            Learn more
          </NuxtLink>
        </div>
      </div>

      <!-- Hero mock -->
      <div
        class="hidden rounded-2xl border border-gray-200 bg-[#f8f8f8] p-4 dark:border-gray-700 dark:bg-gray-900 md:block"
        aria-hidden="true"
      >
        <div class="mb-3 flex items-center gap-1.5">
          <span class="h-2 w-2 rounded-full bg-[#ff5f57]" />
          <span class="h-2 w-2 rounded-full bg-[#febc2e]" />
          <span class="h-2 w-2 rounded-full bg-[#28c840]" />
          <span class="ml-2 text-[10px] text-gray-400">GTM audit — client workspace</span>
        </div>
        <div class="mb-2 grid grid-cols-4 gap-1.5">
          <div class="rounded-md bg-white p-2 dark:bg-gray-800">
            <div class="text-base font-bold">16</div>
            <div class="text-[8px] text-gray-500">Total tags</div>
          </div>
          <div class="rounded-md bg-amber-100 p-2 dark:bg-amber-950/40">
            <div class="text-base font-bold text-amber-900 dark:text-amber-200">2</div>
            <div class="text-[8px] text-amber-800 dark:text-amber-300/80">Paused</div>
          </div>
          <div class="rounded-md bg-green-100 p-2 dark:bg-green-950/40">
            <div class="text-base font-bold text-green-800 dark:text-green-200">1</div>
            <div class="text-[8px] text-green-800 dark:text-green-300/80">Conversions</div>
          </div>
          <div class="rounded-md bg-red-100 p-2 dark:bg-red-950/40">
            <div class="text-base font-bold text-red-800 dark:text-red-200">2</div>
            <div class="text-[8px] text-red-800 dark:text-red-300/80">Variables</div>
          </div>
        </div>
        <div class="space-y-1.5">
          <div class="flex items-start justify-between gap-2 rounded-lg border border-gray-200 border-l-[3px] border-l-red-500 bg-white p-2 dark:border-gray-600 dark:bg-gray-800">
            <div>
              <div class="text-[10px] font-medium text-gray-800 dark:text-gray-100">No consent mode configured</div>
              <div class="text-[9px] text-gray-500">GDPR risk — review tag firing</div>
            </div>
            <span class="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-medium text-red-900">Critical</span>
          </div>
          <div class="flex items-start justify-between gap-2 rounded-lg border border-gray-200 border-l-[3px] border-l-amber-500 bg-white p-2 dark:border-gray-600 dark:bg-gray-800">
            <div>
              <div class="text-[10px] font-medium text-gray-800 dark:text-gray-100">Multiple behavior tools</div>
              <div class="text-[9px] text-gray-500">Consider consolidating scripts</div>
            </div>
            <span class="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-medium text-amber-900">Warning</span>
          </div>
          <div class="flex items-start justify-between gap-2 rounded-lg border border-gray-200 border-l-[3px] border-l-green-500 bg-white p-2 dark:border-gray-600 dark:bg-gray-800">
            <div>
              <div class="text-[10px] font-medium text-gray-800 dark:text-gray-100">GA4 active and firing</div>
              <div class="text-[9px] text-gray-500">Page views enabled</div>
            </div>
            <span class="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-[9px] font-medium text-green-800">OK</span>
          </div>
        </div>
        <div class="mt-2.5 rounded-lg border-l-[3px] border-indigo-500 bg-violet-50 p-2.5 dark:bg-violet-950/40">
          <div class="mb-1 text-[9px] font-semibold uppercase tracking-wide text-indigo-800 dark:text-indigo-300">AI recommendation</div>
          <p class="text-[10px] leading-snug text-gray-600 dark:text-gray-400">
            Implement consent mode v2 where required. Without it, GA4 and Ads can lose conversion modeling accuracy in regulated
            regions.
          </p>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section id="about" class="bg-[#fafafa] py-16 dark:bg-gray-900/50 md:py-[72px]">
      <p class="mb-2.5 text-center text-xs font-semibold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-400">
        How it works
      </p>
      <h2 class="mb-10 px-5 text-center text-2xl font-bold tracking-tight text-[#111] md:mb-12 md:text-[30px] dark:text-white">
        Three steps to better performance
      </h2>
      <div class="mx-auto grid max-w-[900px] gap-px border border-gray-200 bg-gray-200 md:grid-cols-3 dark:border-gray-700 dark:bg-gray-700">
        <div
          v-for="(step, i) in steps"
          :key="step.title"
          class="bg-white p-6 dark:bg-gray-950 md:rounded-none"
          :class="{
            'md:rounded-l-xl': i === 0,
            'md:rounded-r-xl': i === steps.length - 1,
          }"
        >
          <div
            class="mb-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#111] text-[13px] font-bold text-white dark:bg-white dark:text-[#111]"
          >
            {{ i + 1 }}
          </div>
          <h3 class="mb-2 text-base font-semibold text-[#111] dark:text-white">{{ step.title }}</h3>
          <p class="text-[13px] leading-relaxed text-gray-600 dark:text-gray-400">{{ step.body }}</p>
        </div>
      </div>
    </section>

    <!-- Wall of features (ClickUp-style grid) -->
    <section class="py-16 md:py-[72px]" aria-labelledby="wall-heading">
      <div class="mx-auto max-w-[1100px] px-5 pb-10 text-center md:px-10 md:pb-12">
        <p class="mb-2.5 text-xs font-semibold uppercase tracking-[0.08em] text-indigo-600 dark:text-indigo-400">What's inside</p>
        <h2 id="wall-heading" class="text-2xl font-bold tracking-tight text-[#111] md:text-[30px] dark:text-white">
          Everything your project needs
        </h2>
      </div>

      <div
        class="grid w-full grid-cols-4 gap-px border-y border-[#e8e8e8] bg-[#e8e8e8] dark:border-gray-700 dark:bg-gray-700 md:grid-cols-8"
      >
        <template v-for="(cell, idx) in wallCells" :key="idx">
          <div
            v-if="cell.kind === 'small'"
            class="flex flex-col items-center gap-2.5 bg-white px-3 py-6 transition-colors hover:bg-[#fafafa] dark:bg-gray-950 dark:hover:bg-gray-900 md:px-4"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-[10px]"
              :class="cell.iconBg"
              v-html="cell.iconSvg"
            />
            <span class="text-center text-xs font-medium leading-snug text-gray-700 dark:text-gray-300">{{ cell.name }}</span>
          </div>
          <div
            v-else
            class="col-span-2 row-span-1 flex flex-col justify-end bg-white p-6 transition-colors hover:bg-[#fafafa] dark:bg-gray-950 dark:hover:bg-gray-900 md:row-span-2 md:p-8"
            :class="cell.tileBg"
          >
            <p class="mb-2 text-[11px] font-semibold uppercase tracking-[0.06em]" :class="cell.accentClass">{{ cell.eyebrow }}</p>
            <h3 class="mb-2 text-xl font-bold leading-tight tracking-tight text-[#111] md:text-2xl dark:text-white">
              {{ cell.titleLines[0] }}<br />
              {{ cell.titleLines[1] }}
            </h3>
            <p class="max-w-sm text-[13px] leading-snug text-gray-600 dark:text-gray-400">{{ cell.sub }}</p>
          </div>
        </template>
      </div>
    </section>

    <!-- Data we access + CTA -->
    <section class="border-t border-gray-200 bg-[#fafafa] px-5 py-16 dark:border-gray-800 dark:bg-gray-900/40 md:px-10 md:py-[72px]">
      <div class="mx-auto max-w-[1100px]">
        <h2 class="mb-6 text-2xl font-bold text-[#111] dark:text-white">What data we access</h2>
        <ul class="mb-10 max-w-3xl space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          <li>
            <strong class="text-[#111] dark:text-gray-200">Google Tag Manager (read-only):</strong>
            Tags, triggers, and variables for auditing setup. We never modify or publish containers.
          </li>
          <li>
            <strong class="text-[#111] dark:text-gray-200">Google Analytics 4 (read-only):</strong>
            Aggregated metrics for CRO insights. No personal identifiers.
          </li>
          <li>
            <strong class="text-[#111] dark:text-gray-200">Google Search Console (read-only):</strong>
            Clicks, impressions, CTR, and position per page and query.
          </li>
        </ul>
        <div class="flex flex-wrap gap-3">
          <NuxtLink
            to="/contact"
            class="rounded-[10px] bg-[#111] px-6 py-3 text-sm font-medium text-white no-underline hover:opacity-90 dark:bg-white dark:text-[#111]"
          >
            Request access
          </NuxtLink>
          <NuxtLink
            to="/login"
            class="rounded-[10px] border border-gray-300 px-6 py-3 text-sm font-medium text-[#111] no-underline hover:bg-white dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
          >
            Sign in
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer
      class="flex flex-col items-start justify-between gap-4 border-t px-5 py-6 text-xs text-gray-500 sm:flex-row sm:items-center md:px-10 dark:border-gray-800 dark:text-gray-400"
      style="border-color: var(--border-default)"
    >
      <span>© {{ year }} Widev. All rights reserved.</span>
      <div class="flex flex-wrap gap-5">
        <NuxtLink to="/privacy" class="text-gray-500 no-underline hover:text-[#111] dark:hover:text-white">Privacy policy</NuxtLink>
        <NuxtLink to="/terms" class="text-gray-500 no-underline hover:text-[#111] dark:hover:text-gray-200">Terms</NuxtLink>
        <NuxtLink to="/contact" class="text-gray-500 no-underline hover:text-[#111] dark:hover:text-gray-200">Contact</NuxtLink>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
type WallSmall = { kind: 'small'; name: string; iconBg: string; iconSvg: string }
type WallBig = {
  kind: 'big'
  eyebrow: string
  titleLines: [string, string]
  sub: string
  tileBg: string
  accentClass: string
}

const year = new Date().getFullYear()

const heroPills = ['GTM audits', 'GA4 insights', 'CRO reports', 'Tech support', 'AI analysis']

const steps = [
  {
    title: 'Login with your credentials',
    body: 'Access your private portal with the credentials your account manager provided. All data is scoped to your account only.',
  },
  {
    title: 'Connect your analytics',
    body: 'Link GTM, GA4, and Search Console with one click. We read your data in real time — read-only; nothing is modified in your accounts.',
  },
  {
    title: 'Get insights and reports',
    body: 'AI-assisted CRO audits, traffic signals, technical findings, and prioritized recommendations — refreshed when you need them.',
  },
]

/** Order matches reference HTML: 6 small → big → 6 small → big → 6 small → 6 small (row 4 fill) */
const wallCells: (WallSmall | WallBig)[] = [
  {
    kind: 'small',
    name: 'GTM audit',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2" y="2" width="6" height="6" rx="1" fill="#3b82f6"/><rect x="10" y="2" width="6" height="6" rx="1" fill="#3b82f6" opacity=".4"/><rect x="2" y="10" width="6" height="6" rx="1" fill="#3b82f6" opacity=".4"/><rect x="10" y="10" width="6" height="6" rx="1" fill="#3b82f6" opacity=".2"/></svg>',
  },
  {
    kind: 'small',
    name: 'GA4 analytics',
    iconBg: 'bg-green-50 dark:bg-green-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><polyline points="2,14 6,9 10,11 16,4" stroke="#22c55e" stroke-width="2" stroke-linecap="round" fill="none"/></svg>',
  },
  {
    kind: 'small',
    name: 'PageSpeed',
    iconBg: 'bg-orange-50 dark:bg-orange-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="#f97316" stroke-width="1.5" fill="none"/><path d="M9 5v4l3 2" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>',
  },
  {
    kind: 'small',
    name: 'AI analysis',
    iconBg: 'bg-purple-50 dark:bg-purple-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 2l1.8 5h5.2l-4.2 3 1.6 5L9 12.2 4.6 15l1.6-5L2 7h5.2z" fill="#a855f7"/></svg>',
  },
  {
    kind: 'small',
    name: 'CRO reports',
    iconBg: 'bg-green-50 dark:bg-green-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2" y="4" width="14" height="10" rx="2" stroke="#22c55e" stroke-width="1.5" fill="none"/><path d="M5 8h8M5 11h5" stroke="#22c55e" stroke-width="1.2" stroke-linecap="round"/></svg>',
  },
  {
    kind: 'small',
    name: 'Search Console',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 3L15 8v7H3V8z" stroke="#3b82f6" stroke-width="1.5" stroke-linejoin="round" fill="none"/><rect x="6" y="11" width="6" height="4" rx=".5" stroke="#3b82f6" stroke-width="1.2" fill="none"/></svg>',
  },
  {
    kind: 'big',
    eyebrow: 'Data integration',
    titleLines: ['GTM + GA4 +', 'Search Console'],
    sub: 'Connect your Google stack in one place — read-only, refreshed on demand.',
    tileBg: 'bg-violet-50 dark:bg-violet-950/30',
    accentClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    kind: 'small',
    name: 'Live chat',
    iconBg: 'bg-pink-50 dark:bg-pink-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 2C5.7 2 3 4.7 3 8c0 2 1 3.8 2.5 4.9L4 15l3-1c.6.2 1.3.3 2 .3 3.3 0 6-2.7 6-6S12.3 2 9 2z" stroke="#ec4899" stroke-width="1.5" fill="none"/></svg>',
  },
  {
    kind: 'small',
    name: 'Client access',
    iconBg: 'bg-violet-50 dark:bg-violet-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="9" cy="7" r="3" stroke="#6366f1" stroke-width="1.5" fill="none"/><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>',
  },
  {
    kind: 'small',
    name: 'Email reports',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 5h14v10H2z" stroke="#3b82f6" stroke-width="1.5" stroke-linejoin="round" fill="none"/><path d="M2 5l7 7 7-7" stroke="#3b82f6" stroke-width="1.5" stroke-linejoin="round" fill="none"/></svg>',
  },
  {
    kind: 'small',
    name: 'Tickets',
    iconBg: 'bg-green-50 dark:bg-green-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2" y="2" width="14" height="14" rx="2" stroke="#22c55e" stroke-width="1.5" fill="none"/><path d="M5 9l3 3 5-5" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  },
  {
    kind: 'small',
    name: 'Integrations',
    iconBg: 'bg-orange-50 dark:bg-orange-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 2v4M9 12v4M2 9h4M12 9h4" stroke="#f97316" stroke-width="1.5" stroke-linecap="round"/></svg>',
  },
  {
    kind: 'small',
    name: 'History log',
    iconBg: 'bg-violet-50 dark:bg-violet-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="9" cy="9" r="7" stroke="#6366f1" stroke-width="1.5" fill="none"/><path d="M9 6v3l2 2" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>',
  },
  {
    kind: 'big',
    eyebrow: 'Smart findings',
    titleLines: ['Automated', 'CRO audit'],
    sub: 'Critical, warning, and OK flags — prioritized so you know what to fix first.',
    tileBg: 'bg-green-50 dark:bg-green-950/30',
    accentClass: 'text-green-600 dark:text-green-400',
  },
  {
    kind: 'small',
    name: 'Heatmaps',
    iconBg: 'bg-orange-50 dark:bg-orange-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 15l4-4m0 0l3-7 3 7m-6 0h6" stroke="#f97316" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  },
  {
    kind: 'small',
    name: 'Tech support',
    iconBg: 'bg-purple-50 dark:bg-purple-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2" y="2" width="14" height="14" rx="2" stroke="#a855f7" stroke-width="1.5" fill="none"/><path d="M5 9h8M9 5v8" stroke="#a855f7" stroke-width="1.5" stroke-linecap="round"/></svg>',
  },
  {
    kind: 'small',
    name: 'App management',
    iconBg: 'bg-pink-50 dark:bg-pink-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 4h10v10H4z" stroke="#ec4899" stroke-width="1.5" stroke-linejoin="round" fill="none"/><path d="M7 7h4M7 10h2" stroke="#ec4899" stroke-width="1.2" stroke-linecap="round"/></svg>',
  },
  {
    kind: 'small',
    name: 'AI recommendations',
    iconBg: 'bg-violet-50 dark:bg-violet-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 2l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4z" stroke="#6366f1" stroke-width="1.3" stroke-linejoin="round" fill="none"/></svg>',
  },
  {
    kind: 'small',
    name: 'Dashboard',
    iconBg: 'bg-blue-50 dark:bg-blue-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="3" width="5" height="5" rx="1" stroke="#3b82f6" stroke-width="1.5" fill="none"/><rect x="10" y="3" width="5" height="5" rx="1" stroke="#3b82f6" stroke-width="1.5" fill="none"/><rect x="3" y="10" width="5" height="5" rx="1" stroke="#3b82f6" stroke-width="1.5" fill="none"/><rect x="10" y="10" width="5" height="5" rx="1" stroke="#3b82f6" stroke-width="1.5" fill="none"/></svg>',
  },
  {
    kind: 'small',
    name: 'Multi-project',
    iconBg: 'bg-green-50 dark:bg-green-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M2 9h14M9 2v14" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="9" r="7" stroke="#22c55e" stroke-width="1.5" fill="none"/></svg>',
  },
  {
    kind: 'small',
    name: 'Roles & access',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 11a3 3 0 100-6 3 3 0 000 6z" stroke="#6b7280" stroke-width="1.5" fill="none"/><path d="M3 16c0-3.3 3-5 6-5s6 1.7 6 5" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" fill="none"/></svg>',
  },
  {
    kind: 'small',
    name: 'Exports',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 3v10M5 9l4 4 4-4" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M3 15h12" stroke="#6b7280" stroke-width="1.5" stroke-linecap="round"/></svg>',
  },
  {
    kind: 'small',
    name: 'Alerts',
    iconBg: 'bg-amber-50 dark:bg-amber-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 2L2 14h14L9 2z" stroke="#d97706" stroke-width="1.5" stroke-linejoin="round" fill="none"/><path d="M9 7v4" stroke="#d97706" stroke-width="1.5" stroke-linecap="round"/><circle cx="9" cy="12.5" r=".8" fill="#d97706"/></svg>',
  },
  {
    kind: 'small',
    name: 'Roadmap',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 4h12v2H3V4zm0 4h8v2H3V8zm0 4h10v2H3v-2z" stroke="#6b7280" stroke-width="1.3" stroke-linejoin="round" fill="none"/></svg>',
  },
  {
    kind: 'small',
    name: 'Security',
    iconBg: 'bg-gray-100 dark:bg-gray-800',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 2L4 4v5c0 4 2 7 5 8 3-1 5-4 5-8V4L9 2z" stroke="#6b7280" stroke-width="1.5" stroke-linejoin="round" fill="none"/></svg>',
  },
  {
    kind: 'small',
    name: 'Agency-ready',
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/50',
    iconSvg:
      '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="2" y="3" width="14" height="12" rx="2" stroke="#4f46e5" stroke-width="1.5" fill="none"/><path d="M6 7h6M6 10h4" stroke="#4f46e5" stroke-width="1.2" stroke-linecap="round"/></svg>',
  },
]

useSeoMeta({
  title: 'Widev Pro — Clients portal',
  description:
    'Your clients’ portal: GTM audits, GA4, Search Console, CRO reports, and AI insights — read-only, in one private dashboard.',
  ogTitle: 'Widev Pro — Clients portal',
  ogDescription: 'Connect analytics, get verified insights, and manage client work from one place.',
  ogUrl: 'https://support.widev.pro',
})
</script>
