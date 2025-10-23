<template>
  <div class="bg-white rounded-xl shadow-soft p-4 sm:p-6 border border-gray-100">
    <h2 class="text-xl sm:text-2xl font-bold text-secondary mb-6">
      {{ isEditing ? 'Editar Fazenda' : 'Nova Fazenda' }}
    </h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Farm Name -->
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
          Nome da Fazenda *
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="Digite o nome da fazenda"
          class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          :class="{ 'border-error ring-2 ring-error-200': errors.name }"
        />
        <p v-if="errors.name" class="mt-2 text-sm text-error flex items-center">
          <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ errors.name }}
        </p>
      </div>

      <!-- Farm Area -->
      <div>
        <label for="area" class="block text-sm font-medium text-gray-700 mb-2">
          Área (hectares) *
        </label>
        <input
          id="area"
          v-model.number="form.area"
          type="number"
          step="0.01"
          min="0.01"
          required
          placeholder="Digite a área em hectares"
          class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
          :class="{ 'border-error ring-2 ring-error-200': errors.area }"
        />
        <p v-if="errors.area" class="mt-2 text-sm text-error flex items-center">
          <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ errors.area }}
        </p>
      </div>

      <!-- Soil Type -->
      <div>
        <label for="soilType" class="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Solo *
        </label>
        <select
          id="soilType"
          v-model="form.soilType"
          required
          class="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-white"
          :class="{ 'border-error ring-2 ring-error-200': errors.soilType }"
        >
          <option value="">Selecione o tipo de solo</option>
          <option value="arenoso">Arenoso</option>
          <option value="argiloso">Argiloso</option>
          <option value="humoso">Humoso</option>
        </select>
        <p v-if="errors.soilType" class="mt-2 text-sm text-error flex items-center">
          <svg class="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ errors.soilType }}
        </p>
      </div>

      <!-- Error Message -->
      <div v-if="submitError" class="bg-error-50 border border-error-200 rounded-lg p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-error-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-error-800">{{ submitError }}</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          type="button"
          @click="handleCancel"
          class="w-full sm:w-auto px-4 py-2 sm:py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="w-full sm:w-auto px-4 py-2 sm:py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
        >
          {{ loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Salvar') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useFarmsStore } from '../stores/farms.js'

const props = defineProps({
  farm: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['success', 'cancel'])

const farmsStore = useFarmsStore()

const isEditing = computed(() => !!props.farm)
const loading = ref(false)
const submitError = ref('')

// Form data
const form = reactive({
  name: '',
  area: null,
  soilType: ''
})

// Form validation errors
const errors = reactive({
  name: '',
  area: '',
  soilType: ''
})

// Watch for prop changes to populate form
watch(() => props.farm, (newFarm) => {
  if (newFarm) {
    form.name = newFarm.name || ''
    form.area = newFarm.area || null
    form.soilType = newFarm.soilType || ''
  } else {
    resetForm()
  }
}, { immediate: true })

/**
 * Reset form to initial state
 */
const resetForm = () => {
  form.name = ''
  form.area = null
  form.soilType = ''
  clearErrors()
  submitError.value = ''
}

/**
 * Clear validation errors
 */
const clearErrors = () => {
  errors.name = ''
  errors.area = ''
  errors.soilType = ''
}

/**
 * Validate form data
 * @returns {boolean} True if form is valid
 */
const validateForm = () => {
  clearErrors()
  let isValid = true

  // Validate name
  if (!form.name || form.name.trim().length === 0) {
    errors.name = 'Nome da fazenda é obrigatório'
    isValid = false
  } else if (form.name.trim().length < 2) {
    errors.name = 'Nome deve ter pelo menos 2 caracteres'
    isValid = false
  }

  // Validate area
  if (!form.area || form.area <= 0) {
    errors.area = 'Área deve ser um número maior que zero'
    isValid = false
  } else if (form.area > 1000000) {
    errors.area = 'Área não pode ser maior que 1.000.000 hectares'
    isValid = false
  }

  // Validate soil type
  const validSoilTypes = ['arenoso', 'argiloso', 'humoso']
  if (!form.soilType || !validSoilTypes.includes(form.soilType)) {
    errors.soilType = 'Selecione um tipo de solo válido'
    isValid = false
  }

  return isValid
}

/**
 * Handle form submission
 */
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    loading.value = true
    submitError.value = ''

    const farmData = {
      name: form.name.trim(),
      area: form.area,
      soilType: form.soilType
    }

    if (isEditing.value) {
      await farmsStore.updateFarm(props.farm.id, farmData)
    } else {
      await farmsStore.addFarm(farmData)
    }

    emit('success')
    
    if (!isEditing.value) {
      resetForm()
    }
  } catch (error) {
    submitError.value = error.message || 'Erro ao salvar fazenda'
  } finally {
    loading.value = false
  }
}

/**
 * Handle form cancellation
 */
const handleCancel = () => {
  resetForm()
  emit('cancel')
}
</script>