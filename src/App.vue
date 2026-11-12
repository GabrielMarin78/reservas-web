<script setup>
import AvisoToast from '@/components/AvisoToast.vue'
import OfflineBanner from '@/components/OfflineBanner.vue'
</script>

<template>
  <OfflineBanner />
  
  <header>
    <h1>Sistema de reservas</h1>
    <nav>
      <RouterLink to="/reservas">Reservas</RouterLink>
      <RouterLink :to="{ name: 'reserva-nueva' }">Nueva reserva</RouterLink>
    </nav>
  </header>

  <main>
    <RouterView />
  </main>

  <AvisoToast />
</template>