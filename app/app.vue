<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import '../assets/css/main.css'
</script>
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Invalid credentials. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>
