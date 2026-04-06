<template>
  <div class="p-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      <button
        @click="handleLogout"
        class="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
      >
        Logout
      </button>
    </div>

    <!-- Add Client button -->
    <button
      @click="showModal = true"
      class="mb-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
    >
      Add Client
    </button>

    <!-- Clients table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-100 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Name</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Slug</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Site URL</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Created</th>
            <th class="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <!-- TODO: Map over clients -->
          <tr class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">Sample Client</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">sample-client</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">https://example.com</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
              <span class="px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">Active</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">2024-01-01</td>
            <td class="px-6 py-4 text-sm space-x-2">
              <button class="text-blue-600 hover:text-blue-800">Edit</button>
              <button class="text-red-600 hover:text-red-800">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal placeholder -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 class="text-xl font-bold mb-4">Add New Client</h2>
        <!-- TODO: Client form here -->
        <button
          @click="showModal = false"
          class="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-900 font-medium py-2 px-4 rounded-md w-full"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
})

const router = useRouter()
const showModal = ref(false)

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await router.push('/')
}
</script>
