<template>
  <div class="bg-white rounded-xl shadow-soft p-4 sm:p-6 border border-gray-100 animate-fade-in">
    <div class="text-center mb-6">
      <div class="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-4 shadow-medium animate-bounce-subtle">
        <svg class="w-8 h-8 sm:w-10 sm:h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h3 class="text-xl sm:text-2xl font-bold text-secondary mb-4">Resultado do Cálculo ETo</h3>
      
      <!-- Main Result -->
      <div class="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 sm:p-6 mb-6 border-2 border-primary-200 shadow-soft">
        <div class="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-2">
          {{ formatEtoValue(result.eto) }} <span class="text-lg sm:text-xl lg:text-2xl font-medium">mm/dia</span>
        </div>
        <p class="text-gray-700 font-medium text-sm sm:text-base">Evapotranspiração de Referência</p>
        <p class="text-xs sm:text-sm text-gray-600 mt-1">Método FAO-56 Penman-Monteith</p>
      </div>
    </div>

    <!-- Calculation Details -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <!-- Input Parameters -->
      <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 class="text-base sm:text-lg font-semibold text-secondary mb-4 flex items-center">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span class="text-sm sm:text-base">Parâmetros de Entrada</span>
        </h4>
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="text-sm text-gray-600">Temperatura Máxima:</span>
            <span class="font-medium text-gray-900">{{ formatTemperature(inputs.tmax) }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="text-sm text-gray-600">Temperatura Mínima:</span>
            <span class="font-medium text-gray-900">{{ formatTemperature(inputs.tmin) }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="text-sm text-gray-600">Umidade Relativa:</span>
            <span class="font-medium text-gray-900">{{ formatPercentage(inputs.humidity) }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="text-sm text-gray-600">Velocidade do Vento:</span>
            <span class="font-medium text-gray-900">{{ formatWindSpeed(inputs.windSpeed) }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-gray-200">
            <span class="text-sm text-gray-600">Radiação Solar:</span>
            <span class="font-medium text-gray-900">{{ formatSolarRadiation(inputs.solarRadiation) }}</span>
          </div>
          <div class="flex justify-between items-center py-2">
            <span class="text-sm text-gray-600">Dia Juliano:</span>
            <span class="font-medium text-gray-900">{{ inputs.julianDay }}</span>
          </div>
        </div>
      </div>

      <!-- Location and Date -->
      <div class="bg-secondary-50 rounded-xl p-4 border border-secondary-200">
        <h4 class="text-base sm:text-lg font-semibold text-secondary mb-4 flex items-center">
          <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-sm sm:text-base">Informações do Cálculo</span>
        </h4>
        <div class="space-y-3">
          <div class="flex justify-between items-center py-2 border-b border-secondary border-opacity-10">
            <span class="text-sm text-gray-600">Localização:</span>
            <span class="font-medium text-gray-900">{{ result.location }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-secondary border-opacity-10">
            <span class="text-sm text-gray-600">Latitude:</span>
            <span class="font-medium text-gray-900">{{ formatLatitude(result.inputs.latitude) }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-secondary border-opacity-10">
            <span class="text-sm text-gray-600">Altitude:</span>
            <span class="font-medium text-gray-900">{{ result.inputs.altitude }}m</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-secondary border-opacity-10">
            <span class="text-sm text-gray-600">Data do Cálculo:</span>
            <span class="font-medium text-gray-900">{{ formatCalculationDate(result.calculationDate) }}</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-secondary border-opacity-10">
            <span class="text-sm text-gray-600">Dia Juliano:</span>
            <span class="font-medium text-gray-900">{{ inputs.julianDay }} ({{ formatJulianDay(inputs.julianDay) }})</span>
          </div>
          <div class="flex justify-between items-center py-2 border-b border-secondary border-opacity-10">
            <span class="text-sm text-gray-600">Fonte dos Dados:</span>
            <span class="font-medium text-gray-900">{{ dataSourceLabel }}</span>
          </div>
          <div v-if="farm" class="flex justify-between items-center py-2">
            <span class="text-sm text-gray-600">Fazenda:</span>
            <span class="font-medium text-gray-900">{{ farm.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Intermediate Values (Expandable) -->
    <div class="mt-6">
      <button
        @click="showIntermediateValues = !showIntermediateValues"
        class="flex items-center justify-between w-full p-4 bg-primary bg-opacity-5 rounded-lg hover:bg-primary hover:bg-opacity-10 transition-colors border border-primary border-opacity-20"
      >
        <span class="text-lg font-semibold text-secondary flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Valores Intermediários do Cálculo
        </span>
        <svg 
          class="w-5 h-5 text-primary transition-transform"
          :class="{ 'rotate-180': showIntermediateValues }"
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div v-if="showIntermediateValues" class="mt-4 p-4 border border-gray-200 rounded-lg bg-white">
        <div class="mb-4 p-3 bg-secondary bg-opacity-5 rounded-lg border border-secondary border-opacity-10">
          <p class="text-sm text-secondary">
            <strong>Método FAO-56 Penman-Monteith:</strong> Os valores intermediários abaixo mostram cada etapa do cálculo 
            para transparência e validação dos resultados. Todos os valores seguem as especificações técnicas da FAO.
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="(value, key) in result.intermediateValues" :key="key" class="bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div class="text-xs text-gray-500 uppercase tracking-wide mb-1 font-medium">
              {{ getIntermediateValueLabel(key) }}
            </div>
            <div class="font-mono text-sm font-bold text-gray-900">
              {{ formatIntermediateValue(value) }} <span class="text-xs font-normal text-gray-600">{{ getIntermediateValueUnit(key) }}</span>
            </div>
            <div v-if="getIntermediateValueDescription(key)" class="text-xs text-gray-500 mt-1">
              {{ getIntermediateValueDescription(key) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
      <button
        @click="saveCalculation"
        class="w-full sm:w-auto bg-primary hover:bg-primary-600 text-white px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-soft hover:shadow-medium transform hover:scale-105"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span class="text-sm sm:text-base">Salvar Resultado</span>
      </button>
      
      <button
        @click="newCalculation"
        class="w-full sm:w-auto bg-secondary hover:bg-secondary-600 text-white px-6 py-3 sm:py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-soft hover:shadow-medium transform hover:scale-105"
      >
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span class="text-sm sm:text-base">Novo Cálculo</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  result: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['save-calculation', 'new-calculation'])

// Reactive data
const showIntermediateValues = ref(false)

// Computed properties
const result = computed(() => props.result.result)
const inputs = computed(() => props.result.inputs)
const farm = computed(() => props.result.farm)

const dataSourceLabel = computed(() => {
  return props.result.dataSource === 'manual' ? 'Entrada Manual' : 'API OpenWeather'
})

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

const formatJulianDay = (julianDay) => {
  const year = new Date().getFullYear()
  const date = new Date(year, 0, julianDay)
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

const formatIntermediateValue = (value) => {
  if (typeof value !== 'number') return '0'
  if (Math.abs(value) < 0.001) return value.toExponential(3)
  if (Math.abs(value) < 1) return value.toFixed(4)
  if (Math.abs(value) < 100) return value.toFixed(2)
  return value.toFixed(1)
}

const getIntermediateValueLabel = (key) => {
  const labels = {
    tmean: 'Temperatura Média',
    delta: 'Δ (Slope)',
    pressure: 'Pressão Atmosférica',
    gamma: 'γ (Psychrometric)',
    es_tmax: 'es(Tmax)',
    es_tmin: 'es(Tmin)',
    es: 'es (Pressão Vapor Sat.)',
    ea: 'ea (Pressão Vapor Atual)',
    rn: 'Radiação Líquida',
    rns: 'Radiação Solar Líquida',
    rnl: 'Radiação Termal Líquida',
    u2: 'Velocidade Vento 2m',
    soilHeatFlux: 'Fluxo de Calor Solo',
    numerator1: 'Numerador 1 (Radiação)',
    numerator2: 'Numerador 2 (Aerodinâmico)',
    denominator: 'Denominador'
  }
  return labels[key] || key
}

const getIntermediateValueUnit = (key) => {
  const units = {
    tmean: '°C',
    delta: 'kPa/°C',
    pressure: 'kPa',
    gamma: 'kPa/°C',
    es_tmax: 'kPa',
    es_tmin: 'kPa',
    es: 'kPa',
    ea: 'kPa',
    rn: 'MJ/m²/dia',
    rns: 'MJ/m²/dia',
    rnl: 'MJ/m²/dia',
    u2: 'm/s',
    soilHeatFlux: 'MJ/m²/dia',
    numerator1: 'MJ/m²/dia',
    numerator2: 'MJ/m²/dia',
    denominator: 'kPa/°C'
  }
  return units[key] || ''
}

const getIntermediateValueDescription = (key) => {
  const descriptions = {
    tmean: 'Média das temperaturas máxima e mínima',
    delta: 'Inclinação da curva de pressão de vapor',
    pressure: 'Pressão atmosférica baseada na altitude',
    gamma: 'Constante psicrométrica',
    es_tmax: 'Pressão de vapor saturado na temp. máxima',
    es_tmin: 'Pressão de vapor saturado na temp. mínima',
    es: 'Pressão de vapor saturado média',
    ea: 'Pressão de vapor atual do ar',
    rn: 'Radiação líquida total',
    rns: 'Radiação solar líquida (ondas curtas)',
    rnl: 'Radiação termal líquida (ondas longas)',
    u2: 'Velocidade do vento a 2m de altura',
    soilHeatFlux: 'Fluxo de calor no solo (assumido 0)',
    numerator1: 'Componente radiativo da equação',
    numerator2: 'Componente aerodinâmico da equação',
    denominator: 'Denominador da equação P-M'
  }
  return descriptions[key] || ''
}

const saveCalculation = () => {
  emit('save-calculation', props.result)
}

const newCalculation = () => {
  emit('new-calculation')
}
</script>