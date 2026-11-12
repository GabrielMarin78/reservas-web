import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/reservas' },
    {
      path: '/reservas',
      name: 'reservas',
      component: () => import('@/views/ReservasView.vue'), // carga diferida
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'no-encontrada',
      component: () => import('@/views/NotFoundView.vue'),
    },
    {
      path: '/reservas/nueva',
      name: 'reserva-nueva',
      component: () => import('@/views/ReservaFormView.vue'),
    },
    {
      path: '/reservas/:id([0-9a-fA-F]{24})/editar',
      name: 'reserva-editar',
      component: () => import('@/views/ReservaFormView.vue'),
      props: true,
    },    
    {
      path: '/reservas/:id([0-9a-fA-F]{24})', // un id de MongoDB son 24 caracteres hexadecimales
      name: 'reserva-detalle',
      component: () => import('@/views/ReservaDetalleView.vue'),
      props: true, // pasa :id como prop
    },
  ],
})

export default router