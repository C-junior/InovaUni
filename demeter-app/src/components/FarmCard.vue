<template>
  <div
    class="bg-white rounded-xl shadow-soft hover:shadow-medium transition-all duration-200 p-4 sm:p-6 cursor-pointer border border-gray-100 hover:border-primary-200 transform hover:scale-[1.02]"
    @click="handleSelect">
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">
        {{ farm.name }}
      </h3>
      <div class="flex space-x-1 sm:space-x-2 ml-2 flex-shrink-0">
        <button @click.stop="handleViewHistory"
          class="text-gray-400 hover:text-secondary transition-colors p-1 rounded-lg hover:bg-secondary-50"
          title="Ver histórico de cálculos">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
        <button @click.stop="handleEdit"
          class="text-gray-400 hover:text-primary transition-colors p-1 rounded-lg hover:bg-primary-50"
          title="Editar fazenda">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button @click.stop="handleDelete"
          class="text-gray-400 hover:text-error transition-colors p-1 rounded-lg hover:bg-red-50"
          title="Excluir fazenda">
          <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span>{{ formatArea(farm.area) }} hectares</span>
      </div>

      <div class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <span>Solo {{ getSoilTypeLabel(farm.soilType) }}</span>
      </div>

      <div v-if="farm.crop" class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span>{{ farm.crop }}</span>
      </div>

      <div v-if="farm.irrigationType" class="flex items-center text-sm text-gray-600">
        <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <span>{{ farm.irrigationType }}</span>
      </div>
    </div>

    <!-- Calculation Statistics -->
    <div v-if="calculationStats.count > 0" class="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs sm:text-sm font-medium text-primary-700">Histórico de Cálculos</span>
        <span class="text-xs text-gray-500">{{ calculationStats.count }} cálculo{{ calculationStats.count > 1 ? 's' : ''
        }}</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
        <div>
          <span class="text-gray-600">ETo Médio:</span>
          <div class="font-medium text-primary">{{ formatEtoValue(calculationStats.averageEto) }} mm/dia</div>
        </div>
        <div>
          <span class="text-gray-600">Último:</span>
          <div class="font-medium text-secondary">{{ formatLastCalculationDate(calculationStats.lastCalculationDate) }}
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 pt-4 border-t border-gray-100">
      <div class="flex justify-between items-center">
        <span class="text-xs text-gray-500">
          Criada em {{ formatDate(farm.createdAt) }}
        </span>
        <div class="flex items-center text-primary text-xs sm:text-sm font-medium">
          <span>Calcular ETo</span>
          <svg class="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useFarmsStore } from '../stores/farms.js'

const props = defineProps({
  farm: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['select', 'edit', 'delete', 'view-history'])

// Store
const farmsStore = useFarmsStore()

// Computed properties
const calculationStats = computed(() => farmsStore.getFarmCalculationStats(props.farm.id))

/**
 * Format area with proper decimal places
 * @param {number} area - Area in hectares
 * @returns {string} Formatted area
 */
const formatArea = (area) => {
  if (!area) return '0'
  return area % 1 === 0 ? area.toString() : area.toFixed(2)
}

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
 * Format date for display
 * @param {Object} timestamp - Firestore timestamp
 * @returns {string} Formatted date
 */
const formatDate = (timestamp) => {
  if (!timestamp) return ''

  let date
  if (timestamp.toDate) {
    // Firestore timestamp
    date = timestamp.toDate()
  } else if (timestamp instanceof Date) {
    date = timestamp
  } else {
    return ''
  }

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

/**
 * Handle farm selection
 */
const handleSelect = () => {
  emit('select', props.farm)
}

/**
 * Handle farm edit
 */
const handleEdit = () => {
  emit('edit', props.farm)
}

/**
 * Handle farm deletion
 */
const handleDelete = () => {
  emit('delete', props.farm)
}

/**
 * Handle view calculation history
 */
const handleViewHistory = () => {
  emit('view-history', props.farm)
}

/**
 * Format ETo value
 * @param {number} value - ETo value
 * @returns {string} Formatted ETo value
 */
const formatEtoValue = (value) => {
  return typeof value === 'number' ? value.toFixed(2) : '0.00'
}

/**
 * Format last calculation date
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatLastCalculationDate = (dateString) => {
  if (!dateString) return 'Nunca'

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) return 'Hoje'
  if (diffDays === 2) return 'Ontem'
  if (diffDays <= 7) return `${diffDays - 1} dias atrás`

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  })
}

// Lifecycle
onMounted(async () => {
  // Load calculation statistics for this farm
  try {
    await farmsStore.fetchFarmCalculations(props.farm.id, 10) // Load recent calculations for stats
  } catch (error) {
    console.error('Failed to load farm calculation stats:', error)
  }
})
</script>