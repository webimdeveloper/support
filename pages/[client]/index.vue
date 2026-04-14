<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

defineRouteRules({
  ssr: false,
})

const route = useRoute()
const router = useRouter()
const slug = route.params.client as string
const me = await $fetch('/api/auth/me')
const user = (me as any)?.user
const defaultProjectSlug = (me as any)?.defaultProjectSlug

if (user?.role === 'admin') {
  await router.replace('/admin')
} else {
  const projectSlug = defaultProjectSlug || slug
  await router.replace(`/dashboard/${slug}/${projectSlug}`)
}
</script>
