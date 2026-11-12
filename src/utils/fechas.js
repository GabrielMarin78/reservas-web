const formato = new Intl.DateTimeFormat('es-EC', {
  dateStyle: 'medium',
  timeStyle: 'short',
  hourCycle: 'h23',
})

const dos = (n) => String(n).padStart(2, '0')

export const formatoFechaHora = (iso) => formato.format(new Date(iso))

/* ISO o Date -> 'YYYY-MM-DD' en hora local */
export const aFechaLocal = (valor) => {
  const d = new Date(valor)
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`
}

/* ISO o Date -> 'HH:MM' en hora local */
export const aHoraLocal = (valor) => {
  const d = new Date(valor)
  return `${dos(d.getHours())}:${dos(d.getMinutes())}`
}

/* ('2026-12-01', '14:30') -> Date interpretada en hora local */
export const aFecha = (fecha, hora) => new Date(`${fecha}T${hora}`)

/* Igual, pero como ISO 8601 con zona (termina en Z) */
export const aIso = (fecha, hora) => aFecha(fecha, hora).toISOString()

export const hoyLocal = () => aFechaLocal(new Date())