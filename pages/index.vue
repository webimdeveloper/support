<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <header class="border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold" style="color: var(--color-text)">Support Widev Pro</h1>
        <nav class="flex items-center gap-4 text-sm">
          <NuxtLink to="/privacy" style="color: var(--color-text-muted)">Privacy</NuxtLink>
          <NuxtLink to="/terms" style="color: var(--color-text-muted)">Terms</NuxtLink>
          <NuxtLink to="/contact" style="color: var(--color-text-muted)">Contact</NuxtLink>
          <NuxtLink to="/about" style="color: var(--color-text-muted)">About</NuxtLink>
          <NuxtLink to="/login" class="px-3 py-1.5 rounded-md text-white bg-blue-600 hover:bg-blue-700">Sign in</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 py-12 space-y-12">
      <section class="space-y-4">
        <h2 class="text-4xl font-bold" style="color: var(--color-text)">Automated CRO audits for your clients</h2>
        <p class="text-lg max-w-3xl" style="color: var(--color-text-muted)">
          Connect Google Tag Manager, Analytics, and Search Console. Get instant audits and AI-powered recommendations.
        </p>
        <NuxtLink to="/login" class="inline-block px-5 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700">Sign in</NuxtLink>
      </section>

      <section class="grid md:grid-cols-3 gap-4">
        <div class="rounded-lg border p-4" style="border-color: var(--border-default)">
          <h3 class="font-semibold" style="color: var(--color-text)">1. Connect</h3>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">Client connects Google account with one click.</p>
        </div>
        <div class="rounded-lg border p-4" style="border-color: var(--border-default)">
          <h3 class="font-semibold" style="color: var(--color-text)">2. Analyze</h3>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">Portal reads GTM config, GA4 metrics, and Search Console data.</p>
        </div>
        <div class="rounded-lg border p-4" style="border-color: var(--border-default)">
          <h3 class="font-semibold" style="color: var(--color-text)">3. Report</h3>
          <p class="text-sm mt-1" style="color: var(--color-text-muted)">AI generates prioritized CRO recommendations instantly.</p>
        </div>
      </section>

      <section class="space-y-3">
        <h3 class="text-2xl font-semibold" style="color: var(--color-text)">What data we access</h3>
        <p class="text-sm" style="color: var(--color-text-muted)"><strong>Google Tag Manager (read-only):</strong> Tags, triggers, and variables for auditing setup. We never modify or publish.</p>
        <p class="text-sm" style="color: var(--color-text-muted)"><strong>Google Analytics 4 (read-only):</strong> Aggregated page-level metrics for CRO insights. No personal identifiers.</p>
        <p class="text-sm" style="color: var(--color-text-muted)"><strong>Google Search Console (read-only):</strong> Clicks, impressions, CTR, and position per page/query.</p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Support Widev Pro - CRO Portal',
  description: 'Automated CRO audits for agencies and clients with GTM, GA4, and Search Console insights.',
  ogTitle: 'Support Widev Pro - CRO Portal',
  ogDescription: 'Connect GTM, GA4 and Search Console for AI-powered CRO insights.',
  ogUrl: 'https://support.widev.pro',
})
</script>
