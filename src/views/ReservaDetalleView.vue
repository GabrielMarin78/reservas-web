<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { reservasService } from '@/services/reservasService'
import { useAsyncState } from '@/composables/useAsyncState'
import { useAviso } from '@/composables/useAviso'
import { useOnlineStatus } from '@/composables/useOnlineStatus'
import { formatoFechaHora } from '@/utils/fechas'
import StatusMessage from '@/components/StatusMessage.vue'

const props = defineProps({ id: { type: String, required: true } }) // viene de la ruta
const router = useRouter()
const { mostrar } = useAviso()
const { online } = useOnlineStatus()

const TIPOS_PERMITIDOS = ['application/pdf', 'image/png', 'image/jpeg']
const MAX_BYTES = 2 * 1024 * 1024 // mismo límite que la API

/* Carga de la reserva (con cancelación de peticiones) */
const {
  data: reserva,
  error,
  loading,
  execute,
} = useAsyncState((id, signal) => reservasService.obtener(id, signal))

const mensajeError = computed(() =>
  error.value?.status === 404 ? 'Esta reserva no existe o fue eliminada.' : error.value?.message,
)

/* Acciones que modifican datos */
const procesando = ref(false)
const bloqueado = computed(() => procesando.value || !online.value)
const errorAccion = ref(null)

const cargar = () => {
  errorAccion.value = null
  return execute(props.id)
}
watch(() => props.id, cargar, { immediate: true })

/* Ejecuta una acción con estado de proceso, aviso de éxito y error visible.
   Devuelve { resultado } si salió bien, o null si falló. */
async function ejecutar(accion, mensajeExito) {
  procesando.value = true
  errorAccion.value = null
  try {
    const resultado = await accion()
    mostrar(mensajeExito)
    return { resultado }
  } catch (err) {
    errorAccion.value = err
    return null
  } finally {
    procesando.value = false
  }
}

async function cancelar() {
  if (!confirm('¿Cancelar esta reserva? El horario quedará libre.')) return
  const r = await ejecutar(() => reservasService.cancelar(props.id), 'Reserva cancelada')
  if (r) reserva.value = r.resultado
}

async function eliminar() {
  if (!confirm('¿Eliminar definitivamente esta reserva? No se puede deshacer.')) return
  const r = await ejecutar(() => reservasService.eliminar(props.id), 'Reserva eliminada')
  if (r) router.push({ name: 'reservas' })
}

async function subirAdjunto(evento) {
  const input = evento.target
  const archivo = input.files[0]
  if (!archivo) return

  /* Validación en el cliente (la API vuelve a validar el contenido real del archivo) */
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    errorAccion.value = new Error('Solo se permiten archivos PDF, PNG o JPEG.')
  } else if (archivo.size > MAX_BYTES) {
    errorAccion.value = new Error('El archivo excede el máximo de 2 MB.')
  } else {
    const r = await ejecutar(() => reservasService.adjuntar(props.id, archivo), 'Archivo adjuntado')
    if (r) reserva.value = r.resultado
  }
  input.value = '' // permite volver a elegir el mismo archivo
}
</script>

<template>
  <RouterLink to="/reservas">← Volver a las reservas</RouterLink>
  <h2>Detalle de la reserva</h2>

  <StatusMessage v-if="loading" type="loading" />
  <StatusMessage v-else-if="error" type="error" :message="mensajeError" @retry="cargar" />

  <article v-else-if="reserva">
    <dl>
      <dt>Sala</dt>
      <dd>{{ reserva.sala }}</dd>
      <dt>Solicitante</dt>
      <dd>{{ reserva.solicitante }}</dd>
      <dt>Motivo</dt>
      <dd>{{ reserva.motivo }}</dd>
      <dt>Inicio</dt>
      <dd>{{ formatoFechaHora(reserva.inicio) }}</dd>
      <dt>Fin</dt>
      <dd>{{ formatoFechaHora(reserva.fin) }}</dd>
      <dt>Estado</dt>
      <dd>{{ reserva.estado }}</dd>
      <dt>Adjunto</dt>
      <dd v-if="reserva.adjunto">
        <a :href="reservasService.urlAdjunto(reserva.id)" target="_blank" rel="noopener">
          {{ reserva.adjunto.nombreOriginal }}
        </a>
        ({{ Math.ceil(reserva.adjunto.tamano / 1024) }} KB)
      </dd>
      <dd v-else>Sin adjunto</dd>
    </dl>

    <p v-if="errorAccion" class="error-accion" role="alert">
      {{ errorAccion.message }}
      <button v-if="errorAccion.status === 409" type="button" @click="cargar">
        Recargar reserva
      </button>
    </p>

    <div class="acciones">
      <template v-if="reserva.estado === 'activa'">
        <label class="adjuntar">
          {{ reserva.adjunto ? 'Reemplazar adjunto' : 'Adjuntar archivo' }}
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            :disabled="bloqueado"
            @change="subirAdjunto"
          />
        </label>
        <RouterLink class="boton" :to="{ name: 'reserva-editar', params: { id: reserva.id } }">Editar</RouterLink>
        <button type="button" :disabled="bloqueado" @click="cancelar">Cancelar reserva</button>
      </template>
      <button type="button" :disabled="bloqueado" @click="eliminar">Eliminar</button>
      <span v-if="procesando">Procesando…</span>
    </div>
  </article>
</template>

<style scoped>
dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.5rem 1rem;
}
dt {
  font-weight: bold;
}
dd {
  margin: 0;
}
.acciones {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.adjuntar {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}
.error-accion {
  padding: 0.75rem;
  border-radius: 6px;
  background: #fee2e2;
  color: #991b1b;
}
</style>