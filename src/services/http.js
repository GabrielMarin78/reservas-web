const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

/* Error uniforme para toda la app. status 0 = sin conexión con el servidor. */
export class HttpError extends Error {
  constructor(status, mensaje, { codigo = null, detalles = [] } = {}) {
    super(mensaje)
    this.name = 'HttpError'
    this.status = status
    this.codigo = codigo
    this.detalles = detalles
  }
}

/* Intenta leer el formato de error de la API: { error: { codigo, mensaje, detalles } } */
async function leerError(response) {
  try {
    const cuerpo = await response.json()
    const e = cuerpo?.error
    if (e) {
      return new HttpError(response.status, e.mensaje, {
        codigo: e.codigo,
        detalles: e.detalles ?? [],
      })
    }
  } catch {
    // el cuerpo no era JSON (por ejemplo, un 502 del proxy): se usa el mensaje genérico
  }
  return new HttpError(response.status, `Error ${response.status}: ${response.statusText}`)
}

export async function request(path, { method = 'GET', body, signal } = {}) {
  const opciones = { method, signal }

  if (body) {
    if (body instanceof FormData) {
      opciones.body = body // el navegador agrega el Content-Type con su boundary
    } else {
      opciones.body = JSON.stringify(body)
      opciones.headers = { 'Content-Type': 'application/json' }
    }
  }

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, opciones)
  } catch (err) {
    if (err.name === 'AbortError') throw err // petición cancelada a propósito: no es un error de red
    throw new HttpError(0, 'No hay conexión con el servidor')
  }

  if (!response.ok) throw await leerError(response)

  return response.status === 204 ? null : response.json()
}

export const urlCompleta = (path) => `${BASE_URL}${path}`