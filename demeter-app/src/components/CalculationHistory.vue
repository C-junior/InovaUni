<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-semibold text-gray-900 flex items-center">
        <svg class="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        Histórico de Cálculos
      </h3>
      
      <button
        @click="refreshHistory"
        :disabled="isLoading"
        class="text-sm text-primary hover:text-green-700 disabled:text-gray-400 flex items-center"
      >
        <svg 
          class="w-4 h-4 mr-1" 
          :class="{ 'animate-spin': isLoading }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ isLoading ? 'Carregando...' : 'Atualizar' }}
      </button>
    </div>

    <!-- Statistics Summary -->
    <div v-if="statistics.count > 0" class="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-primary bg-opacity-10 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-primary">{{ statistics.count }}</div>
        <div class="text-sm text-gray-600">Cálculos</div>
      </div>
      <div class="bg-secondary bg-opacity-10 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-secondary">{{ formatEtoValue(statistics.averageEto) }}</div>
        <div class="text-sm text-gray-600">ETo Médio</div>
      </div>
      <div class="bg-green-100 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-green-700">{{ formatEtoValue(statistics.maxEto) }}</div>
        <div class="text-sm text-gray-600">ETo Máximo</div>
      </div>
      <div class="bg-blue-100 rounded-lg p-4 text-center">
        <div class="text-2xl font-bold text-blue-700">{{ formatEtoValue(statistics.minEto) }}</div>
        <div class="text-sm text-gray-600">ETo Mínimo</div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && calculations.length === 0" class="text-center py-8">
      <div class="mx-auto w-12 h-12 bg-primary bg-opacity-20 rounded-full flex items-center justify-center mb-4">
        <svg class="w-6 h-6 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <p class="text-gray-600">Carregando histórico de cálculos...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="calculations.length === 0" class="text-center py-8">
      <div class="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h4 class="text-lg font-medium text-gray-900 mb-2">Nenhum cálculo encontrado</h4>
      <p class="text-gray-600">Realize seu primeiro cálculo ETo para ver o histórico aqui.</p>
    </div>

    <!-- Calculations List -->
    <div v-else class="space-y-4">
      <div
        v-for="calculation in calculations"
        :key="calculation.id"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center">
            <div class="w-3 h-3 bg-primary rounded-full mr-3"></div>
            <div>
              <div class="font-medium text-gray-900">
                ETo: {{ formatEtoValue(calculation.result.eto) }} mm/dia
              </div>
              <div class="text-sm text-gray-500">
                {{ formatCalculationDate(calculation.date) }}
              </div>
            </div>
          </div>
          
          <div class="flex items-center space-x-2">
            <button
              @click="toggleDetails(calculation.id)"
              class="text-sm text-primary hover:text-green-700 flex items-center"
            >
              <span>{{ expandedCalculations.has(calculation.id) ? 'Ocultar' : 'Detalhes' }}</span>
              <svg 
                class="w-4 h-4 ml-1 transition-transform"
                :class="{ 'rotate-180': expandedCalculations.has(calculation.id) }"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <button
              @click="deleteCalculation(calculation.id)"
              class="text-sm text-red-600 hover:text-red-800 flex items-center"
              :disabled="isDeleting"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Expanded Details -->
        <div v-if="expandedCalculations.has(calculation.id)" class="mt-4 pt-4 border-t border-gray-100">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Input Parameters -->
            <div class="bg-gray-50 rounded-lg p-3">
              <h5 class="text-sm font-medium text-gray-700 mb-2">Parâmetros de Entrada</h5>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Temp. Máxima:</span>
                  <span class="font-medium">{{ formatTemperature(calculation.inputs.tmax) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Temp. Mínima:</span>
                  <span class="font-medium">{{ formatTemperature(calculation.inputs.tmin) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Umidade:</span>
                  <span class="font-medium">{{ formatPercentage(calculation.inputs.humidity) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Vento:</span>
                  <span class="font-medium">{{ formatWindSpeed(calculation.inputs.windSpeed) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Radiação Solar:</span>
                  <span class="font-medium">{{ formatSolarRadiation(calculation.inputs.solarRadiation) }}</span>
                </div>
              </div>
            </div>

            <!-- Calculation Info -->
            <div class="bg-secondary bg-opacity-5 rounded-lg p-3">
              <h5 class="text-sm font-medium text-gray-700 mb-2">Informações do Cálculo</h5>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Dia Juliano:</span>
                  <span class="font-medium">{{ calculation.inputs.julianDay }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Fonte dos Dados:</span>
                  <span class="font-medium">{{ getDataSourceLabel(calculation.dataSource) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Localização:</span>
                  <span class="font-medium">{{ calculation.location }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Latitude:</span>
                  <span class="font-medium">{{ formatLatitude(calculation.inputs.latitude) }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Altitude:</span>
                  <span class="font-medium">{{ calculation.inputs.altitude }}m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Load More Button -->
    <div v-if="calculations.length >= 50" class="mt-6 text-center">
      <button
        @click="loadMoreCalculations"
        :disabled="isLoadingMore"
        class="bg-primary hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        {{ isLoadingMore ? 'Carregando...' : 'Carregar Mais' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFarmsStore } from '../stores/farms.js'

// Props
const props = defineProps({
  farmId: {
    type: String,
    required: true
  }
})

// Store
const farmsStore = useFarmsStore()

// Reactive data
const isLoading = ref(false)
const isLoadingMore = ref(false)
const isDeleting = ref(false)
const expandedCalculations = ref(new Set())

// Computed properties
const calculations = computed(() => farmsStore.getFarmCalculations(props.farmId))
const statistics = computed(() => farmsStore.getFarmCalculationStats(props.farmId))

// Methods
const refreshHistory = async () => {
  isLoading.value = true
  try {
    await farmsStore.fetchFarmCalculations(props.farmId)
  } catch (error) {
    console.error('Failed to refresh calculation history:', error)
  } finally {
    isLoading.value = false
  }
}

const loadMoreCalculations = async () => {
  isLoadingMore.value = true
  try {
    await farmsStore.fetchFarmCalculations(props.farmId, calculations.value.length + 50)
  } catch (error) {
    console.error('Failed to load more calculations:', error)
  } finally {
    isLoadingMore.value = false
  }
}

const deleteCalculation = async (calculationId) => {
  if (!confirm('Tem certeza que deseja excluir este cálculo?')) {
    return
  }

  isDeleting.value = true
  try {
    await farmsStore.deleteCalculation(props.farmId, calculationId)
    expandedCalculations.value.delete(calculationId)
  } catch (error) {
    console.error('Failed to delete calculation:', error)
    alert('Erro ao excluir cálculo. Tente novamente.')
  } finally {
    isDeleting.value = false
  }
}

const toggleDetails = (calculationId) => {
  if (expandedCalculations.value.has(calculationId)) {
    expandedCalculations.value.delete(calculationId)
  } else {
    expandedCalculations.value.add(calculationId)
  }
}

// Formatting methods
const formatEtoValue = (value) => {
  return typeof value === 'number' ? value.toFixed(2) : '0.00'
}

const formatTemperature = (value) => {
  return `${typeof value === 'number' ? value.toFixed(1) : '0.0'}°C`
}

const formatPercentage = (value) => {
  return `${typeof value === 'number' ? Math.round(value) : '0'}%`
}

const formatWindSpeed = (value) => {
  return `${typeof value === 'number' ? value.toFixed(1) : '0.0'} m/s`
}

const formatSolarRadiation = (value) => {
  return `${typeof value === 'number' ? value.toFixed(1) : '0.0'} MJ/m²/dia`
}

const formatLatitude = (value) => {
  if (typeof value !== 'number') return '0°'
  return value < 0 ? `${Math.abs(value)}°S` : `${value}°N`
}

const formatCalculationDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('pt-BR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getDataSourceLabel = (dataSource) => {
  return dataSource === 'manual' ? 'Entrada Manual' : 'API OpenWeather'
}

// Lifecycle
onMounted(() => {
  refreshHistory()
})
</script>