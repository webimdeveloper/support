<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">widev.pro Support</h1>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="slug" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Name / Username</label>
            <input
              id="slug"
              v-model="form.slug"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="e.g., dayodental"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div v-if="error" class="text-red-600 dark:text-red-400 text-sm">{{ error }}</div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Sign In - Support Widev Pro' })

const form = reactive({ slug: '', password: '' })
const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response: any = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { slug: form.slug, password: form.password },
    })
    if (response?.user?.role === 'admin') {
      window.location.href = '/admin'
    } else if (response?.user?.role === 'client') {
      const projectSlug = response?.user?.projectSlug || form.slug
      window.location.href = `/${form.slug}/${projectSlug}`
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || err.message || 'Login failed.'
  } finally {
    isLoading.value = false
  }
}
</script>
