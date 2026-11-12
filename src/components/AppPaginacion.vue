<script setup>
defineProps({
  pagina: { type: Number, required: true },
  totalPaginas: { type: Number, required: true },
})
defineEmits(['cambiar'])
</script>

<template>
  <nav class="paginacion" aria-label="Paginación">
    <button type="button" :disabled="pagina <= 1" @click="$emit('cambiar', pagina - 1)">
      ← Anterior
    </button>
    <span>Página {{ pagina }} de {{ totalPaginas }}</span>
    <button type="button" :disabled="pagina >= totalPaginas" @click="$emit('cambiar', pagina + 1)">
      Siguiente →
    </button>
  </nav>
</template>

<style scoped>
.paginacion {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
}
</style>