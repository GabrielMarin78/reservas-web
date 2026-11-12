# Reservas Web

Aplicación de una sola página (SPA) y PWA construida con **Vue 3** que consume la API
[`reservas-api`](https://github.com/GabrielMarin78/reservas-api.git) para gestionar reservas de salas y laboratorios.

> Proyecto de la Unidad 3 de Aplicaciones Web 2.

## Funcionalidades

- Listado de reservas con filtros por sala y estado, y paginación.
- Detalle de reserva, con cancelación, eliminación y subida de adjunto (PDF, PNG o JPEG, máx. 2 MB).
- Formulario de creación y edición con validación en el cliente y errores del servidor junto a cada campo.
- Estados de **carga, éxito, vacío y error** en todas las vistas, con botón de reintento.
- Control de concurrencia: la edición envía `version`; un conflicto (409) ofrece recargar los datos.
- **PWA**: instalable, abre sin conexión y muestra los últimos datos consultados.

## Requisitos

- Node.js 22.18 o superior
- La API `reservas-api` de la unidad anterior, en ejecución en `http://localhost:3000` (con MongoDB).
Este repositorio no la incluye porque es un proyecto independiente.

## Instalación y ejecución

```bash
npm install
npm run dev        # http://localhost:5173
```

En desarrollo, Vite redirige `/api` y `/socket.io` a `http://localhost:3000` (ver `vite.config.js`),
por lo que no hace falta configurar CORS en la API.
Si la API corre en otro puerto, ajusta `target` en el bloque `server.proxy` de `vite.config.js`.

### Probar la PWA

El service worker no se activa con `npm run dev`. Usa:

```bash
npm run build
npm run preview    # http://localhost:4173
```

Luego, en las herramientas de desarrollo (F12 → Application) se pueden revisar el manifest,
el service worker y el caché, y probar el modo sin conexión.

## Variables de entorno

| Variable | Por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `/api/v1` | URL base de la API. Solo se define si la API está en otro origen. |

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción en `dist/` |
| `npm run preview` | Sirve la compilación (con service worker) |
| `npm run lint` | Revisa el código con ESLint |

## Estructura

```
src/
├── components/      Componentes presentacionales (props abajo, eventos arriba)
├── composables/     useAsyncState, useAviso, useOnlineStatus
├── constants/       Lista de salas
├── router/          Rutas con carga diferida
├── services/        http.js (único acceso HTTP) y reservasService.js
├── utils/           Formato y conversión de fechas
└── views/           Páginas: lista, detalle y formulario
```

## Arquitectura

- **Las vistas** obtienen los datos y orquestan; **los componentes** solo reciben props y emiten eventos.
- **No se usa Pinia.** Los filtros y la página viven en la URL; el único estado compartido son el aviso
  (`useAviso`) y el estado de conexión (`useOnlineStatus`), que sí deben sobrevivir al cambio de ruta.
- **Acceso HTTP centralizado** en `services/http.js`: valida `response.ok`, convierte los errores en `HttpError`
  (con `status`, `codigo` y `detalles` según el formato de la API) y distingue una cancelación voluntaria de un fallo de red.
- **Condiciones de carrera:** `useAsyncState` cancela con `AbortController` la petición anterior y descarta
  las respuestas que llegan tarde.

## API consumida

Base: `/api/v1`

| Método | Ruta | Uso |
|---|---|---|
| GET | `/reservas` | Listado con `sala`, `estado`, `pagina`, `limite` |
| GET | `/reservas/:id` | Detalle |
| POST | `/reservas` | Crear |
| PUT | `/reservas/:id` | Reemplazar (requiere `version`) |
| PATCH | `/reservas/:id/cancelar` | Cancelar |
| DELETE | `/reservas/:id` | Eliminar |
| POST / GET | `/reservas/:id/adjunto` | Subir y descargar adjunto |

## PWA y estrategia de caché

| Recurso | Estrategia |
|---|---|
| HTML, JS, CSS e iconos | Precaché (la app abre sin conexión) |
| `GET /reservas` y `GET /reservas/:id` | Network First, espera de 4 s, 50 entradas, 24 h, solo respuestas 200 |
| Adjuntos | No se cachean |
| POST, PUT, PATCH, DELETE | No se cachean; sin conexión las acciones se deshabilitan |
| Socket.io | Excluido |

## Limitaciones conocidas

- Sin conexión solo se pueden consultar los datos ya visitados; no hay cola de cambios pendientes.
- `navigator.onLine` indica con certeza la falta de red, pero no garantiza que el servidor responda.
- Con el proxy de desarrollo, una API caída responde 500, que Network First entrega tal cual en lugar del caché.
- El formulario usa una sola fecha, por lo que no admite reservas que crucen la medianoche.

