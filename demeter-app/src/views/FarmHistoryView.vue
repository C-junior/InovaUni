<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <button
              @click="goBack"
              class="mr-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 class="text-2xl font-bold text-secondary">Demeter</h1>
            <span class="ml-3 text-sm text-gray-500">Histórico de Cálculos</span>
          </div>
          
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-3">
              <img 
                v-if="userPhotoURL" 
                :src="userPhotoURL" 
                :alt="userDisplayName"
                class="w-8 h-8 rounded-full"
              >
              <div class="text-sm">
                <p class="font-medium text-gray-900">{{ userDisplayName }}</p>
                <p class="text-gray-500">{{ userEmail }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <!-- Farm Info -->
      <div v-if="farm" class="mb-8">
        <h2 class="text-3xl font-bold text-gray-900 mb-2">Histórico de Cálculos ETo</h2>
        <div class="flex items-center space-x-4 text-gray-600">
          <span class="font-medium">{{ farm.name }}</span>
          <span>•</span>
          <span>{{ farm.area }} hectares</span>
          <span>•</span>
          <span>Solo {{ getSoilTypeLabel(farm.soilType) }}</span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && !farm" class="bg-white rounded-lg shadow-md p-8 text-center">
        <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <svg class="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Carregando...</h3>
        <p class="text-gray-600">Carregando informações da fazenda...</p>
      </div>

      <!-- Calculation History Component -->
      <div v-else-if="farm">
        <CalculationHistory :farm-id="farm.id" />
      </div>

      <!-- Error State -->
      <div v-else class="bg-white rounded-lg shadow-md p-8 text-center">
        <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Fazenda não encontrada</h3>
        <p class="text-gray-600 mb-6">A fazenda solicitada não foi encontrada ou você não tem permissão para acessá-la.</p>
        <button
          @click="goBack"
          class="bg-primary hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Voltar ao Dashboard
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { useFarmsStore } from '../stores/farms.js'
import { navigationHelpers } from '../router/index.js'
import CalculationHistory from '../components/CalculationHistory.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const farmsStore = useFarmsStore()

const farm = ref(null)
const isLoading = ref(false)

const userDisplayName = computed(() => userStore.userDisplayName)
const userEmail = computed(() => userStore.userEmail)
const userPhotoURL = computed(() => userStore.userPhotoURL)

/**
 * Load farm data on component mount
 */
onMounted(async () => {
  isLoading.value = true
  
  const farmId = route.params.farmId
  if (farmId) {
    // Try to get from store first (may have been set by router guard)
    const existingFarm = farmsStore.currentFarm
    if (existingFarm && existingFarm.id === farmId) {
      farm.value = existingFarm
    } else {
      // Try to get from farms list
      const farmFromStore = farmsStore.getFarmById(farmId)
      if (farmFromStore) {
        farm.value = farmFromStore
        farmsStore.setCurrentFarm(farmFromStore)
      } else {
        try {
          farm.value = await farmsStore.getFarm(farmId)
          farmsStore.setCurrentFarm(farm.value)
        } catch (error) {
          console.error('Failed to load farm:', error)
          // Don't redirect, show error state instead
        }
      }
    }
  }
  
  isLoading.value = false
})

/**
 * Get soil type label in Portuguese
 * @param {string} soilType - Soil type code
 * @returns {string} Soil type label
 */
const getSoilTypeLabel = (soilType) => {
  const labels = {
    'arenoso': 'arenoso',
    'argiloso': 'argiloso',
    'humoso': 'humoso'
  }
  return labels[soilType] || soilType
}

/**
 * Go back to dashboard
 */
const goBack = () => {
  navigationHelpers.goToDashboard()
}
</script>