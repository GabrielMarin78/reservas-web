<script setup>
defineProps({
  type: {
    type: String,
    required: true,
    validator: (v) => ['loading', 'empty', 'error'].includes(v),
  },
  message: { type: String, default: '' },
})
defineEmits(['retry'])
</script>

<template>
  <div class="status" :class="`status--${type}`" :role="type === 'error' ? 'alert' : 'status'">
    <p v-if="type === 'loading'">Cargando…</p>

    <template v-else-if="type === 'empty'">
      <p>{{ message || 'No hay elementos para mostrar.' }}</p>
    </template>

    <template v-else>
      <p>{{ message || 'Ocurrió un error inesperado.' }}</p>
      <button type="button" @click="$emit('retry')">Reintentar</button>
    </template>
  </div>
</template>

<style scoped>
.status {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 6px;
  background: #f3f4f6;
}
.status--error {
  background: #fee2e2;
  color: #991b1b;
}
</style>