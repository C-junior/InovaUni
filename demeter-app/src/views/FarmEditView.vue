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
            <span class="hidden sm:inline ml-3 text-sm text-gray-500">Editar Fazenda</span>
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
    <main class="max-w-2xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <!-- Loading state -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">Carregando fazenda...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ error }}</p>
            <button
              @click="loadFarm"
              class="mt-2 text-sm text-red-600 hover:text-red-500 underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>

      <!-- Form -->
      <div v-else-if="farm">
        <div class="mb-6 sm:mb-8 animate-fade-in">
          <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Editar Fazenda</h2>
          <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
            Atualize as informações da fazenda "{{ farm.name }}".
          </p>
        </div>

        <FarmForm 
          :farm="farm"
          @success="handleSuccess" 
          @cancel="handleCancel"
        />
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
import FarmForm from '../components/FarmForm.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const farmsStore = useFarmsStore()

const farm = ref(null)
const loading = ref(false)
const error = ref('')

const userDisplayName = computed(() => userStore.userDisplayName)
const userEmail = computed(() => userStore.userEmail)
const userPhotoURL = computed(() => userStore.userPhotoURL)

/**
 * Load farm data on component mount
 */
onMounted(async () => {
  await loadFarm()
})

/**
 * Load farm data
 */
const loadFarm = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const farmId = route.params.id
    if (!farmId) {
      throw new Error('ID da fazenda não fornecido')
    }

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
        // Fetch from Firestore
        farm.value = await farmsStore.getFarm(farmId)
        farmsStore.setCurrentFarm(farm.value)
      }
    }
  } catch (err) {
    error.value = err.message || 'Erro ao carregar fazenda'
    console.error('Failed to load farm:', err)
  } finally {
    loading.value = false
  }
}

/**
 * Handle successful farm update
 */
const handleSuccess = () => {
  navigationHelpers.goToDashboard()
}

/**
 * Handle form cancellation
 */
const handleCancel = () => {
  navigationHelpers.goToDashboard()
}

/**
 * Go back to dashboard
 */
const goBack = () => {
  navigationHelpers.goToDashboard()
}
</script>