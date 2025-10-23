<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-soft border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16 sm:h-18">
          <div class="flex items-center">
            <button
              @click="goBack"
              class="mr-3 sm:mr-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 class="text-xl sm:text-2xl font-bold text-secondary">Demeter</h1>
            <span class="hidden sm:inline ml-3 text-sm text-gray-500">Cálculo ETo</span>
          </div>
          
          <div class="flex items-center space-x-2 sm:space-x-4">
            <div class="hidden sm:flex items-center space-x-3">
              <img 
                v-if="userPhotoURL" 
                :src="userPhotoURL" 
                :alt="userDisplayName"
                class="w-8 h-8 rounded-full ring-2 ring-primary-100"
              >
              <div class="text-sm">
                <p class="font-medium text-gray-900 truncate max-w-32">{{ userDisplayName }}</p>
                <p class="text-gray-500 truncate max-w-32">{{ userEmail }}</p>
              </div>
            </div>
            
            <!-- Mobile user avatar -->
            <img 
              v-if="userPhotoURL" 
              :src="userPhotoURL" 
              :alt="userDisplayName"
              class="sm:hidden w-8 h-8 rounded-full ring-2 ring-primary-100"
            >
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-4xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div v-if="farm" class="mb-6 sm:mb-8 animate-fade-in">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Cálculo ETo</h2>
        <div class="bg-primary-50 border border-primary-200 rounded-lg p-3 sm:p-4">
          <p class="text-sm sm:text-base text-gray-700">
            <span class="font-medium text-primary-700">Fazenda:</span> {{ farm.name }}
          </p>
          <p class="text-xs sm:text-sm text-gray-600 mt-1">
            {{ farm.area }} hectares • Solo {{ farm.soilType }}
          </p>
        </div>
      </div>

      <!-- Calculation Form -->
      <div class="mb-8">
        <CalculationForm 
          :farm="farm"
          @calculation-complete="handleCalculationComplete"
          @calculation-error="handleCalculationError"
        />
      </div>

      <!-- Results Display -->
      <div v-if="calculationResult" class="mb-8">
        <ResultCard :result="calculationResult" />
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="bg-white rounded-lg shadow-md p-8 text-center">
        <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
          <svg class="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Carregando...</h3>
        <p class="text-gray-600">Preparando o sistema de cálculo...</p>
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
import CalculationForm from '../components/CalculationForm.vue'
import ResultCard from '../components/ResultCard.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const farmsStore = useFarmsStore()

const farm = ref(null)
const calculationResult = ref(null)
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
      // Fallback to fetching from store
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
          navigationHelpers.goToDashboard()
          return
        }
      }
    }
  } else {
    navigationHelpers.goToDashboard()
    return
  }
  
  isLoading.value = false
})

/**
 * Handle successful calculation
 */
const handleCalculationComplete = async (calculationData) => {
  try {
    calculationResult.value = calculationData
    
    // Save calculation to Firestore
    if (farm.value?.id) {
      await farmsStore.saveCalculation(farm.value.id, calculationData)
      console.log('Calculation saved successfully')
    }
    
    // Show success notification
    console.log('Calculation completed successfully:', calculationData)
  } catch (error) {
    console.error('Failed to save calculation:', error)
    // Still show the result even if saving fails
  }
}

/**
 * Handle calculation error
 */
const handleCalculationError = (error) => {
  console.error('Calculation error:', error)
  calculationResult.value = null
}

/**
 * Go back to dashboard
 */
const goBack = () => {
  navigationHelpers.goToDashboard()
}
</script>