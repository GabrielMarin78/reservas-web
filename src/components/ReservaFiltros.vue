<script setup>
import { SALAS } from '@/constants/salas'

const props = defineProps({
  modelValue: { type: Object, required: true }, // { sala, estado }
})
const emit = defineEmits(['update:modelValue'])

function cambiar(campo, valor) {
  emit('update:modelValue', { ...props.modelValue, [campo]: valor })
}
</script>

<template>
  <form class="filtros" @submit.prevent>
    <label>
      Sala
      <select :value="modelValue.sala" @change="cambiar('sala', $event.target.value)">
        <option value="">Todas</option>
        <option v-for="s in SALAS" :key="s.codigo" :value="s.codigo">
          {{ s.codigo }} · {{ s.nombre }}
        </option>
      </select>
    </label>

    <label>
      Estado
      <select :value="modelValue.estado" @change="cambiar('estado', $event.target.value)">
        <option value="">Todos</option>
        <option value="activa">Activa</option>
        <option value="cancelada">Cancelada</option>
      </select>
    </label>
  </form>
</template>

<style scoped>
.filtros {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 1rem 0;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}
</style>