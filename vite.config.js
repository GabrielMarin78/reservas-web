import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        name: 'Sistema de reservas',
        short_name: 'Reservas',
        description: 'Reservas de salas y laboratorios',
        lang: 'es',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#42b883',
        background_color: '#ffffff',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // App shell: se precachea para que la app abra sin conexión
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallback: '/index.html',
        // La API y Socket.io nunca deben responderse con el index.html
        navigateFallbackDenylist: [/^\/api\//, /^\/socket\.io\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // Solo GET del listado y del detalle. Excluye /adjunto, PUT, PATCH, DELETE y POST.
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              /^\/api\/v1\/reservas(\/[0-9a-fA-F]{24})?\/?$/.test(url.pathname),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-reservas',
              networkTimeoutSeconds: 4,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),     
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
    server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/socket.io': { target: 'http://localhost:3000', ws: true },
    },
  },
})
