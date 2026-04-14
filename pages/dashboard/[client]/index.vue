<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const route = useRoute()
const router = useRouter()
const clientSlug = String(route.params.client || '')

await router.replace(`/${clientSlug}`)
</script>
