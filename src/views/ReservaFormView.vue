<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { reservasService } from '@/services/reservasService'
import { useAsyncState } from '@/composables/useAsyncState'
import { useAviso } from '@/composables/useAviso'
import { aFechaLocal, aHoraLocal } from '@/utils/fechas'
import { useOnlineStatus } from '@/composables/useOnlineStatus'
import StatusMessage from '@/components/StatusMessage.vue'
import ReservaForm from '@/components/ReservaForm.vue'

const props = defineProps({ id: { type: String, default: null } }) // sin id = crear
const router = useRouter()
const { mostrar } = useAviso()
const { online } = useOnlineStatus()

const esEdicion = computed(() => props.id !== null)

/* Campo de la API -> campo del formulario */
const CAMPOS = { sala: 'sala', solicitante: 'solicitante', motivo: 'motivo', inicio: 'horaInicio', fin: 'horaFin' }

const vacio = () => ({
  sala: '', solicitante: '', motivo: '', fecha: '', horaInicio: '08:00', horaFin: '09:00',
})

/* Carga (solo al editar) */
const {
  data: reserva,
  error,
  loading,
  execute,
} = useAsyncState((id, signal) => reservasService.obtener(id, signal))

const enviando = ref(false)
const erroresCampo = ref({})
const errorGeneral = ref(null)
const conflictoVersion = ref(false)

function limpiarErrores() {
  erroresCampo.value = {}
  errorGeneral.value = null
  conflictoVersion.value = false
}

const cargar = () => {
  limpiarErrores()
  return execute(props.id)
}

watch(
  () => props.id,
  (id) => {
    limpiarErrores()
    if (id) cargar()
  },
  { immediate: true },
)

const mensajeError = computed(() =>
  error.value?.status === 404 ? 'Esta reserva no existe o fue eliminada.' : error.value?.message,
)

const inicial = computed(() => {
  if (!esEdicion.value || !reserva.value) return vacio()
  const r = reserva.value
  return {
    sala: r.sala,
    solicitante: r.solicitante,
    motivo: r.motivo,
    fecha: aFechaLocal(r.inicio),
    horaInicio: aHoraLocal(r.inicio),
    horaFin: aHoraLocal(r.fin),
  }
})

/* Traduce el error de la API (400, 409, 422...) a mensajes junto a cada campo. */
function repartirErrores(err) {
  const detalles = err.detalles ?? []
  conflictoVersion.value = detalles.some((d) => d.campo === 'version')
  errorGeneral.value = err.message

  const porCampo = {}
  for (const d of detalles) {
    const campo = CAMPOS[d.campo]
    if (campo && !porCampo[campo]) porCampo[campo] = d.mensaje
  }
  erroresCampo.value = porCampo
}

async function guardar(datos) {
  enviando.value = true
  limpiarErrores()
  try {
    const guardada = esEdicion.value
      ? await reservasService.reemplazar(props.id, datos, reserva.value.version)
      : await reservasService.crear(datos)
    mostrar(esEdicion.value ? 'Reserva actualizada' : 'Reserva creada')
    router.push({ name: 'reserva-detalle', params: { id: guardada.id } })
  } catch (err) {
    repartirErrores(err)
  } finally {
    enviando.value = false
  }
}
</script>

<template>
  <RouterLink :to="esEdicion ? { name: 'reserva-detalle', params: { id } } : { name: 'reservas' }">
    ← Volver
  </RouterLink>
  <h2>{{ esEdicion ? 'Editar reserva' : 'Nueva reserva' }}</h2>

  <!-- Estados de carga al editar -->
  <template v-if="esEdicion">
    <StatusMessage v-if="loading" type="loading" />
    <StatusMessage v-else-if="error" type="error" :message="mensajeError" @retry="cargar" />
    <p v-else-if="reserva && reserva.estado !== 'activa'">
      No se puede editar una reserva cancelada.
    </p>
  </template>

  <template v-if="!esEdicion || (reserva && !loading && !error && reserva.estado === 'activa')">
    <p v-if="errorGeneral" class="error-general" role="alert">
      {{ errorGeneral }}
      <template v-if="conflictoVersion">
        <br />
        <button type="button" @click="cargar">Recargar datos (se descartan tus cambios)</button>
      </template>
    </p>

    <ReservaForm
      :key="esEdicion ? `editar-${reserva.version}` : 'nueva'"
      :inicial="inicial"
      :enviando="enviando"
      :sin-conexion="!online"
      :errores-servidor="erroresCampo"
      :texto-boton="esEdicion ? 'Guardar cambios' : 'Crear reserva'"
      @submit="guardar"
    />
  </template>
</template>

<style scoped>
.error-general {
  padding: 0.75rem;
  border-radius: 6px;
  background: #fee2e2;
  color: #991b1b;
  max-width: 28rem;
}
</style>