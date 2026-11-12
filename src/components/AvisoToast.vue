<script setup>
import { useAviso } from '@/composables/useAviso'

const { aviso, cerrar } = useAviso()
</script>

<template>
  <div v-if="aviso" class="toast" :class="`toast--${aviso.tipo}`" role="status">
    <span>{{ aviso.mensaje }}</span>
    <button type="button" aria-label="Cerrar aviso" @click="cerrar">×</button>
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  background: #dcfce7;
  color: #166534;
  box-shadow: 0 2px 8px rgb(0 0 0 / 20%);
}
.toast--error {
  background: #fee2e2;
  color: #991b1b;
}
</style>