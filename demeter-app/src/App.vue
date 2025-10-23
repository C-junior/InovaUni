<script setup>
import { RouterView } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from './stores/user.js'

const userStore = useUserStore()
const loading = computed(() => userStore.loading)
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 antialiased">
    <!-- Loading spinner while authentication state is being determined -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center px-4">
      <div class="text-center animate-fade-in">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
        <div class="space-y-2">
          <p class="text-lg font-medium text-gray-900">Demeter</p>
          <p class="text-sm text-gray-600">Carregando aplicação...</p>
        </div>
      </div>
    </div>
    
    <!-- Main application content -->
    <RouterView v-else class="animate-fade-in" />
  </div>
</template>

<style>
/* Global styles */
body {
  margin: 0;
  font-family: 'Inter', system-ui, sans-serif;
}

#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
