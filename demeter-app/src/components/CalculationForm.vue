<template>
  <div class="bg-white rounded-xl shadow-soft p-4 sm:p-6 border border-gray-100">
    <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-6">Cálculo de Evapotranspiração (ETo)</h3>
    
    <!-- Fixed Location Parameters -->
    <div class="mb-6 p-4 bg-secondary-50 rounded-lg border border-secondary-100">
      <h4 class="text-sm font-medium text-secondary-700 mb-3 flex items-center">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Parâmetros Fixos - Palmas (TO)
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
        <div class="flex justify-between sm:block">
          <span class="text-gray-600">Latitude:</span>
          <span class="font-medium sm:ml-2">10°S</span>
        </div>
        <div class="flex justify-between sm:block">
          <span class="text-gray-600">Altitude:</span>
          <span class="font-medium sm:ml-2">230m</span>
        </div>
      </div>
    </div>

    <!-- Weather Data Section -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-sm font-medium text-gray-700">Dados Meteorológicos</h4>
        <button
          @click="refreshWeatherData"
          :disabled="isLoadingWeather"
          class="text-sm text-primary hover:text-green-700 disabled:text-gray-400 flex items-center"
        >
          <svg 
            class="w-4 h-4 mr-1" 
            :class="{ 'animate-spin': isLoadingWeather }"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ isLoadingWeather ? 'Atualizando...' : 'Atualizar' }}
        </button>
      </div>

      <!-- Weather Data Display -->
      <div v-if="weatherData" class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
        <div class="space-y-3">
          <div class="flex justify-between items-center p-3 bg-info-50 rounded-lg border border-info-100">
            <span class="text-sm text-gray-600">Temp. Máxima:</span>
            <span class="font-medium text-info-700">{{ weatherData.tmax }}°C</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-info-50 rounded-lg border border-info-100">
            <span class="text-sm text-gray-600">Temp. Mínima:</span>
            <span class="font-medium text-info-700">{{ weatherData.tmin }}°C</span>
          </div>
        </div>
        <div class="space-y-3">
          <div class="flex justify-between items-center p-3 bg-primary-50 rounded-lg border border-primary-100">
            <span class="text-sm text-gray-600">Umidade:</span>
            <span class="font-medium text-primary-700">{{ weatherData.humidity }}%</span>
          </div>
          <div class="flex justify-between items-center p-3 bg-primary-50 rounded-lg border border-primary-100">
            <span class="text-sm text-gray-600">Vento:</span>
            <span class="font-medium text-primary-700">{{ weatherData.windSpeed }} m/s</span>
          </div>
        </div>
      </div>

      <!-- Weather Status -->
      <div v-if="weatherStatus" class="mb-4 p-3 rounded-lg" :class="weatherStatusClass">
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path v-if="weatherStatus.type === 'success'" fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            <path v-else fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          <span class="text-sm">{{ weatherStatus.message }}</span>
        </div>
      </div>
    </div>

    <!-- Manual Solar Radiation Input -->
    <div class="mb-6">
      <label for="solarRadiation" class="block text-sm font-medium text-gray-700 mb-2">
        Radiação Solar (Rs) *
      </label>
      <div class="relative">
        <input
          id="solarRadiation"
          v-model.number="formData.solarRadiation"
          type="number"
          step="0.1"
          min="0"
          max="50"
          required
          class="w-full px-3 py-2 sm:py-3 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          :class="{ 'border-error ring-2 ring-error-200': errors.solarRadiation }"
          placeholder="Ex: 22.5"
        />
        <span class="absolute right-3 top-2 sm:top-3 text-sm text-gray-500">MJ/m²/dia</span>
      </div>
      <p v-if="errors.solarRadiation" class="mt-2 text-sm text-error flex items-center">
        <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        {{ errors.solarRadiation }}
      </p>
      <p class="mt-2 text-xs text-gray-500 bg-warning-50 border border-warning-200 rounded-lg p-2">
        <svg class="w-4 h-4 inline mr-1 text-warning-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
        Valor típico para Palmas: 20-25 MJ/m²/dia
      </p>
    </div>

    <!-- Manual Input Toggle -->
    <div class="mb-6">
      <label class="flex items-center">
        <input
          v-model="useManualInput"
          type="checkbox"
          class="rounded border-gray-300 text-primary focus:ring-primary"
        />
        <span class="ml-2 text-sm text-gray-700">Usar entrada manual para dados meteorológicos</span>
      </label>
    </div>

    <!-- Manual Weather Input (when enabled) -->
    <div v-if="useManualInput" class="mb-6 p-4 border border-gray-200 rounded-lg">
      <h4 class="text-sm font-medium text-gray-700 mb-4">Entrada Manual de Dados</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Temperatura Máxima (°C) *
          </label>
          <input
            v-model.number="manualData.tmax"
            type="number"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ex: 32.5"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Temperatura Mínima (°C) *
          </label>
          <input
            v-model.number="manualData.tmin"
            type="number"
            step="0.1"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ex: 23.0"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Umidade Relativa (%) *
          </label>
          <input
            v-model.number="manualData.humidity"
            type="number"
            min="0"
            max="100"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ex: 65"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Velocidade do Vento (m/s) *
          </label>
          <input
            v-model.number="manualData.windSpeed"
            type="number"
            step="0.1"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ex: 2.1"
          />
        </div>
      </div>
    </div>

    <!-- Calculate Button -->
    <div class="flex justify-center">
      <button
        @click="performCalculation"
        :disabled="!canCalculate || isCalculating"
        class="w-full sm:w-auto bg-secondary hover:bg-secondary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-soft hover:shadow-medium transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
      >
        <svg 
          v-if="isCalculating" 
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-sm sm:text-base">{{ isCalculating ? 'Calculando...' : 'Calcular ETo' }}</span>
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="calculationError" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <div>
          <h4 class="text-sm font-medium text-red-800">Erro no Cálculo</h4>
          <p class="text-sm text-red-700 mt-1">{{ calculationError }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { getWeatherForEtoCalculation, getDefaultWeatherValues, isApiKeyConfigured } from '../services/weatherApi.js'
import { calculateETo, getJulianDay } from '../utils/etoCalculator.js'

// Props
const props = defineProps({
  farm: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['calculation-complete', 'calculation-error'])

// Reactive data
const weatherData = ref(null)
const isLoadingWeather = ref(false)
const weatherStatus = ref(null)
const useManualInput = ref(false)
const isCalculating = ref(false)
const calculationError = ref(null)

const formData = reactive({
  solarRadiation: 22.5
})

const manualData = reactive({
  tmax: 32.0,
  tmin: 23.0,
  humidity: 65,
  windSpeed: 2.0
})

const errors = reactive({
  solarRadiation: null
})

// Computed properties
const weatherStatusClass = computed(() => {
  if (!weatherStatus.value) return ''
  
  return weatherStatus.value.type === 'success' 
    ? 'bg-green-50 text-green-700 border border-green-200'
    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
})

const canCalculate = computed(() => {
  const hasValidSolarRadiation = formData.solarRadiation && 
    formData.solarRadiation > 0 && 
    formData.solarRadiation <= 50

  if (useManualInput.value) {
    return hasValidSolarRadiation &&
      manualData.tmax &&
      manualData.tmin &&
      manualData.humidity &&
      manualData.windSpeed &&
      manualData.tmax > manualData.tmin
  }

  return hasValidSolarRadiation && weatherData.value
})

// Methods
const refreshWeatherData = async () => {
  if (!isApiKeyConfigured()) {
    weatherStatus.value = {
      type: 'warning',
      message: 'API key não configurada. Use entrada manual ou configure a chave da OpenWeather API.'
    }
    useManualInput.value = true
    return
  }

  isLoadingWeather.value = true
  weatherStatus.value = null
  calculationError.value = null

  try {
    weatherData.value = await getWeatherForEtoCalculation()
    weatherStatus.value = {
      type: 'success',
      message: `Dados atualizados com sucesso (${new Date().toLocaleTimeString()})`
    }
  } catch (error) {
    console.error('Failed to fetch weather data:', error)
    weatherStatus.value = {
      type: 'warning',
      message: 'Falha ao obter dados meteorológicos. Use entrada manual ou tente novamente.'
    }
    
    // Set default values for manual input
    const defaults = getDefaultWeatherValues()
    Object.assign(manualData, defaults)
    useManualInput.value = true
  } finally {
    isLoadingWeather.value = false
  }
}

const validateForm = () => {
  errors.solarRadiation = null

  if (!formData.solarRadiation || formData.solarRadiation <= 0) {
    errors.solarRadiation = 'Radiação solar é obrigatória e deve ser maior que 0'
    return false
  }

  if (formData.solarRadiation > 50) {
    errors.solarRadiation = 'Radiação solar deve ser menor que 50 MJ/m²/dia'
    return false
  }

  return true
}

const performCalculation = async () => {
  if (!validateForm()) {
    return
  }

  isCalculating.value = true
  calculationError.value = null

  try {
    // Prepare input data
    const inputData = useManualInput.value ? manualData : weatherData.value
    
    const calculationInputs = {
      tmax: inputData.tmax,
      tmin: inputData.tmin,
      humidity: inputData.humidity,
      windSpeed: inputData.windSpeed,
      solarRadiation: formData.solarRadiation,
      julianDay: getJulianDay()
    }

    // Perform calculation
    const result = await calculateETo(calculationInputs)

    // Emit success event
    emit('calculation-complete', {
      result,
      farm: props.farm,
      inputs: calculationInputs,
      dataSource: useManualInput.value ? 'manual' : 'api'
    })

  } catch (error) {
    console.error('ETo calculation failed:', error)
    calculationError.value = error.message || 'Erro desconhecido no cálculo'
    emit('calculation-error', error)
  } finally {
    isCalculating.value = false
  }
}

// Watchers
watch(() => formData.solarRadiation, () => {
  if (errors.solarRadiation) {
    validateForm()
  }
})

// Lifecycle
onMounted(() => {
  // Try to load weather data on component mount
  refreshWeatherData()
})
</script>