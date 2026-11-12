import { ref, onBeforeUnmount } from 'vue'

/*
 Envuelve una función asíncrona y expone sus estados.
 El fetcher recibe los argumentos de execute() y, al final, un AbortSignal.
 Si se llama a execute() de nuevo, la petición anterior se cancela y su
 respuesta (aunque llegue tarde) se descarta: evita condiciones de carrera.
 */
export function useAsyncState(fetcher) {
  const data = ref(null)
  const error = ref(null)
  const loading = ref(false)
  let controladorActual = null

  async function execute(...args) {
    controladorActual?.abort() // cancela la petición previa
    const controlador = new AbortController()
    controladorActual = controlador

    loading.value = true
    error.value = null
    try {
      const resultado = await fetcher(...args, controlador.signal)
      if (controladorActual !== controlador) return // llegó tarde: ya hay una más nueva
      data.value = resultado
    } catch (err) {
      if (err.name === 'AbortError' || controladorActual !== controlador) return
      error.value = err
    } finally {
      if (controladorActual === controlador) loading.value = false
    }
  }

  onBeforeUnmount(() => controladorActual?.abort()) // al salir de la vista, cancela

  return { data, error, loading, execute }
}