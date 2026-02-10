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
            <h1 class="text-xl sm:text-2xl font-bold text-secondary">HydroCultivo AI</h1>
            <span class="hidden sm:inline ml-3 text-sm text-gray-500">
              {{ showChat ? 'Consultor IA' : 'Cálculo ETo' }}
            </span>
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
    <main class="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <!-- Farm Info -->
      <div v-if="farm" class="mb-6 sm:mb-8 animate-fade-in">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {{ showChat ? 'Consultor de Irrigação IA' : 'Cálculo ETo' }}
        </h2>
        <div class="bg-primary-50 border border-primary-200 rounded-lg p-3 sm:p-4">
          <p class="text-sm sm:text-base text-gray-700">
            <span class="font-medium text-primary-700">Fazenda:</span> {{ farm.name }}
          </p>
          <p class="text-xs sm:text-sm text-gray-600 mt-1">
            {{ farm.area }} hectares • Solo {{ farm.soilType }}
          </p>
        </div>
      </div>

      <!-- Chat with AI -->
      <div v-if="showChat" class="animate-fade-in">
        <AIChat 
          :farm-data="farm"
          :etc-data="calculationResult?.result"
          @close="closeChat"
        />
      </div>

      <!-- Calculation Form (only show when not in chat) -->
      <div v-else>
        <!-- Calculation Form -->
        <div class="mb-8">
          <CalculationForm 
            :farm="farm"
            @calculation-complete="handleCalculationComplete"
            @calculation-error="handleCalculationError"
          />
        </div>

        <!-- Results Display with AI Chat Button -->
        <div v-if="calculationResult" ref="resultSection" class="mb-8 space-y-6">
          <ResultCard :result="calculationResult" />
          
          <!-- AI Chat Button -->
          <div class="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
            <div class="flex items-start space-x-4">
              <div class="flex-shrink-0">
                <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Consulte nosso Especialista em Irrigação</h3>
                <p class="text-gray-600 mb-4">
                  Agora que você tem os dados de evapotranspiração, converse com nossa IA especializada 
                  para obter recomendações personalizadas sobre manejo de irrigação e otimização da lâmina de água.
                </p>
                <button
                  @click="openChat"
                  class="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Conversar com Especialista IA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { useFarmsStore } from '../stores/farms.js'
import { navigationHelpers } from '../router/index.js'
import CalculationForm from '../components/CalculationForm.vue'
import ResultCard from '../components/ResultCard.vue'
import AIChat from '../components/AIChat.vue'
import kcStore from '@/data/kcData.js'

const route = useRoute()
const userStore = useUserStore()
const farmsStore = useFarmsStore()

const farm = ref(null)
const calculationResult = ref(null)
const isLoading = ref(false)
const showChat = ref(false)
const resultSection = ref(null)

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
    // Extract the result from the calculation data
    const { result, inputs } = calculationData
    
    // Calculate ETc based on crop type using data from JSON
    let kc = 1.0 // Default coefficient
    
    const farmCrop = farm.value.crop?.toLowerCase() || ''
    
    // Busca Kc no arquivo de dados
    const cropData = kcStore.kcValues.find(item => 
      item.cultura.toLowerCase() === farmCrop
    )
    
    kc = cropData ? cropData.kc : 1.0
    
    console.log('Cultura da fazenda:', farmCrop)
    console.log('Dados da cultura encontrados:', cropData)
    console.log('Kc utilizado:', kc)
    
    const etc = result.eto * kc
    
    // Keep a consistent payload shape used by ResultCard and farms store
    calculationResult.value = {
      inputs,
      dataSource: calculationData.dataSource || 'manual',
      farm: farm.value,
      result: {
        ...result,
        etc: parseFloat(etc.toFixed(2)),
        kc,
        radiation: inputs.solarRadiation || 15, // Define radiacao solar padrao como 15 MJ/m2/dia
        date: new Date().toISOString().split('T')[0],
        farmId: farm.value.id,
        farmName: farm.value.name,
        crop: farm.value.crop
      }
    }
    
    // Save calculation to Firestore
    if (farm.value?.id) {
      await farmsStore.saveCalculation(farm.value.id, calculationResult.value)
      console.log('Calculation saved successfully')
    }
    
    // Show success notification
    console.log('Calculation completed successfully:', calculationResult.value)

    // Auto-scroll to results for better UX
    await nextTick()
    if (resultSection.value) {
      resultSection.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
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
 * Open AI chat with current calculation results
 */
const openChat = () => {
  if (calculationResult.value) {
    showChat.value = true
  }
}

/**
 * Close chat and return to calculation view
 */
const closeChat = () => {
  showChat.value = false
}

/**
 * Go back to dashboard
 */
const goBack = () => {
  if (showChat.value) {
    closeChat()
  } else {
    navigationHelpers.goToDashboard()
  }
}
</script>
