<script setup>
import { computed, reactive, ref } from 'vue'
import { SALAS } from '@/constants/salas'
import { aFecha, aIso, hoyLocal } from '@/utils/fechas'

const props = defineProps({
  inicial: { type: Object, required: true },
  enviando: { type: Boolean, default: false },
  erroresServidor: { type: Object, default: () => ({}) },
  textoBoton: { type: String, default: 'Guardar' },
  sinConexion: { type: Boolean, default: false },
})
const emit = defineEmits(['submit'])

const MAX_MS = 4 * 60 * 60 * 1000 // máximo 4 horas, como la API
const HORAS = Array.from({ length: 48 }, (_, i) => {
  const h = String(Math.floor(i / 2)).padStart(2, '0')
  return `${h}:${i % 2 ? '30' : '00'}` // solo :00 y :30
})

const form = reactive({ ...props.inicial })
const intentado = ref(false) // los errores se muestran tras el primer intento de envío

// Si la reserva tiene una sala que no está en la lista, se agrega para no perderla
const salas = computed(() =>
  !props.inicial.sala || SALAS.some((s) => s.codigo === props.inicial.sala)
    ? SALAS
    : [...SALAS, { codigo: props.inicial.sala, nombre: 'otra sala' }],
)

const errores = computed(() => {
  const e = {}
  const solicitante = form.solicitante.trim()
  const motivo = form.motivo.trim()

  if (!form.sala) e.sala = 'Seleccione una sala.'
  if (solicitante.length < 3 || solicitante.length > 80) {
    e.solicitante = 'Debe tener entre 3 y 80 caracteres.'
  }
  if (motivo.length < 3 || motivo.length > 200) {
    e.motivo = 'Debe tener entre 3 y 200 caracteres.'
  }
  if (!form.fecha) {
    e.fecha = 'Seleccione una fecha.'
    return e
  }

  const inicio = aFecha(form.fecha, form.horaInicio)
  const fin = aFecha(form.fecha, form.horaFin)
  // Como la API: solo se exige futuro si el inicio cambió (al editar una reserva ya empezada)
  const cambioInicio =
    form.fecha !== props.inicial.fecha || form.horaInicio !== props.inicial.horaInicio

  if (cambioInicio && inicio <= new Date()) {
    e.horaInicio = 'El inicio debe ser una fecha y hora futura.'
  }
  if (fin <= inicio) e.horaFin = 'El fin debe ser posterior al inicio.'
  else if (fin - inicio > MAX_MS) e.horaFin = 'La duración máxima es de 4 horas.'
  return e
})

const mensaje = (campo) =>
  (intentado.value && errores.value[campo]) || props.erroresServidor[campo] || ''

function enviar() {
  intentado.value = true
  if (Object.keys(errores.value).length > 0) return
  emit('submit', {
    sala: form.sala,
    solicitante: form.solicitante.trim(),
    motivo: form.motivo.trim(),
    inicio: aIso(form.fecha, form.horaInicio),
    fin: aIso(form.fecha, form.horaFin),
  })
}
</script>

<template>
  <form novalidate @submit.prevent="enviar">
    <label>
      Sala
      <select v-model="form.sala" :aria-invalid="!!mensaje('sala')">
        <option value="">Seleccione una sala…</option>
        <option v-for="s in salas" :key="s.codigo" :value="s.codigo">
          {{ s.codigo }} · {{ s.nombre }}
        </option>
      </select>
      <small v-if="mensaje('sala')" class="error">{{ mensaje('sala') }}</small>
    </label>

    <label>
      Solicitante
      <input v-model="form.solicitante" type="text" maxlength="80" :aria-invalid="!!mensaje('solicitante')" />
      <small v-if="mensaje('solicitante')" class="error">{{ mensaje('solicitante') }}</small>
    </label>

    <label>
      Motivo
      <textarea v-model="form.motivo" rows="3" maxlength="200" :aria-invalid="!!mensaje('motivo')" />
      <small v-if="mensaje('motivo')" class="error">{{ mensaje('motivo') }}</small>
    </label>

    <label>
      Fecha
      <input v-model="form.fecha" type="date" :min="hoyLocal()" :aria-invalid="!!mensaje('fecha')" />
      <small v-if="mensaje('fecha')" class="error">{{ mensaje('fecha') }}</small>
    </label>

    <div class="horas">
      <label>
        Hora de inicio
        <select v-model="form.horaInicio" :aria-invalid="!!mensaje('horaInicio')">
          <option v-for="h in HORAS" :key="h" :value="h">{{ h }}</option>
        </select>
        <small v-if="mensaje('horaInicio')" class="error">{{ mensaje('horaInicio') }}</small>
      </label>

      <label>
        Hora de fin
        <select v-model="form.horaFin" :aria-invalid="!!mensaje('horaFin')">
          <option v-for="h in HORAS" :key="h" :value="h">{{ h }}</option>
        </select>
        <small v-if="mensaje('horaFin')" class="error">{{ mensaje('horaFin') }}</small>
      </label>
    </div>

    <small v-if="sinConexion" class="error">Sin conexión: no se puede guardar ahora.</small>
    <button type="submit" :disabled="enviando || sinConexion">
      {{ enviando ? 'Guardando…' : textoBoton }}
    </button>
  </form>
</template>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 28rem;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}
.horas {
  display: flex;
  gap: 1rem;
}
.horas label {
  flex: 1;
}
[aria-invalid='true'] {
  border-color: #b91c1c;
}
.error {
  color: #b91c1c;
}
</style>