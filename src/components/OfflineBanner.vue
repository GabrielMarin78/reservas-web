<script setup>
import { useOnlineStatus } from '@/composables/useOnlineStatus'

const { online } = useOnlineStatus()
</script>

<template>
  <div v-if="!online" class="offline" role="status">
    Sin conexión. Se puedeconsultar los datos guardados, pero no hacer cambios.
  </div>
</template>

<style scoped>
.offline {
  padding: 0.5rem 1rem;
  background: #fef3c7;
  color: #92400e;
  text-align: center;
  font-size: 0.9rem;
}
</style>