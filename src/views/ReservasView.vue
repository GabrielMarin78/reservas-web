<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { reservasService } from '@/services/reservasService'
import { useAsyncState } from '@/composables/useAsyncState'
import StatusMessage from '@/components/StatusMessage.vue'
import ReservaFiltros from '@/components/ReservaFiltros.vue'
import AppPaginacion from '@/components/AppPaginacion.vue'
import { formatoFechaHora } from '@/utils/fechas'

const LIMITE = 10
const route = useRoute()
const router = useRouter()

/* La fuente de verdad de filtros y página es la URL */
const filtros = computed(() => ({
  sala: route.query.sala ?? '',
  estado: route.query.estado ?? '',
}))
const pagina = computed(() => Math.max(1, Number(route.query.pagina) || 1))

const { data, error, loading, execute } = useAsyncState((params, signal) =>
  reservasService.listar(params, signal),
)

const cargar = () => execute({ ...filtros.value, pagina: pagina.value, limite: LIMITE })

function actualizarUrl(nuevos) {
  const query = {}
  for (const [clave, valor] of Object.entries(nuevos)) {
    if (valor !== '' && valor !== null && valor !== undefined) query[clave] = valor
  }
  router.push({ query })
}

/* Al cambiar un filtro se vuelve a la página 1 */
const cambiarFiltros = (nuevos) => actualizarUrl({ ...nuevos, pagina: 1 })
const cambiarPagina = (n) => actualizarUrl({ ...filtros.value, pagina: n })

/* Recarga solo cuando cambian filtros o página, y solo mientras esta vista está activa */
watch(
  () => [route.query.sala, route.query.estado, route.query.pagina].join('|'),
  () => {
    if (route.name === 'reservas') cargar()
  },
  { immediate: true },
)
</script>

<template>
  <h2>Reservas</h2>

  <ReservaFiltros :model-value="filtros" @update:model-value="cambiarFiltros" />

  <StatusMessage v-if="loading" type="loading" />
  <StatusMessage v-else-if="error" type="error" :message="error.message" @retry="cargar" />
  <StatusMessage
    v-else-if="data && !data.datos.length"
    type="empty"
    message="No hay reservas que coincidan con los filtros."
  />
  <template v-else-if="data">
    <ul>
      <li v-for="reserva in data.datos" :key="reserva.id">
        <RouterLink :to="{ name: 'reserva-detalle', params: { id: reserva.id } }">
          <strong>{{ reserva.sala }}</strong>
        </RouterLink>
        · {{ reserva.solicitante }} · {{ formatoFechaHora(reserva.inicio) }} ({{ reserva.estado }})
      </li>
    </ul>
    <p>{{ data.meta.total }} reserva(s) en total</p>
    <AppPaginacion
      :pagina="data.meta.pagina"
      :total-paginas="data.meta.totalPaginas"
      @cambiar="cambiarPagina"
    />
  </template>
</template>