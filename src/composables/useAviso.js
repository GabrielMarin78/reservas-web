import { ref } from 'vue'

const aviso = ref(null) // { mensaje, tipo }
let temporizador = null

export function useAviso() {
  function mostrar(mensaje, tipo = 'exito') {
    clearTimeout(temporizador)
    aviso.value = { mensaje, tipo }
    temporizador = setTimeout(() => (aviso.value = null), 4000)
  }

  function cerrar() {
    clearTimeout(temporizador)
    aviso.value = null
  }

  return { aviso, mostrar, cerrar }
}