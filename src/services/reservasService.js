import { request, urlCompleta } from './http'

/* Arma ?a=1&b=2 omitiendo valores vacíos. */
function aQuery(filtros = {}) {
  const params = new URLSearchParams()
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== '' && valor !== null && valor !== undefined) params.set(clave, valor)
  }
  const texto = params.toString()
  return texto ? `?${texto}` : ''
}

export const reservasService = {
  /* Devuelve { datos: [...], meta: { pagina, limite, total, totalPaginas } } */
  listar(filtros, signal) {
    return request(`/reservas${aQuery(filtros)}`, { signal })
  },

  async obtener(id, signal) {
    return (await request(`/reservas/${id}`, { signal })).datos
  },

  async crear(reserva) {
    return (await request('/reservas', { method: 'POST', body: reserva })).datos
  },

  /* PUT exige `version` en el cuerpo (control de concurrencia de la API). */
  async reemplazar(id, reserva, version) {
    return (await request(`/reservas/${id}`, { method: 'PUT', body: { ...reserva, version } })).datos
  },

  async cancelar(id) {
    return (await request(`/reservas/${id}/cancelar`, { method: 'PATCH' })).datos
  },

  eliminar(id) {
    return request(`/reservas/${id}`, { method: 'DELETE' })
  },

  async adjuntar(id, archivo) {
    const form = new FormData()
    form.append('archivo', archivo) // el campo debe llamarse "archivo"
    return (await request(`/reservas/${id}/adjunto`, { method: 'POST', body: form })).datos
  },

  urlAdjunto: (id) => urlCompleta(`/reservas/${id}/adjunto`),
}