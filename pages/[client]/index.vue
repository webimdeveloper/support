<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const slug = route.params.client as string
const { data } = await useFetch('/api/admin/clients')

const getProjectSlugFromUrl = (siteUrl: string) => {
  try {
    const hostname = new URL(siteUrl).hostname.replace(/^www\./, '')
    return hostname.replace(/\./g, '-')
  } catch {
    return slug
  }
}

const match = (data.value as any[] | null)?.find((item) => item.slug === slug)
const projectSlug = match?.site_url ? getProjectSlugFromUrl(match.site_url) : slug
await router.replace(`/${slug}/${projectSlug}`)

const handleLogout = async () => {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await router.push('/')
}
</script>
