<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header with user info and logout -->
    <header class="bg-white shadow-soft border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16 sm:h-18">
          <div class="flex items-center">
            <img src="/images/logo.png" alt="Demeter Logo" class="w-8 h-8 sm:w-10 sm:h-10 mr-3 object-contain" />
            <h1 class="text-xl sm:text-2xl font-bold text-secondary">Demeter</h1>
            <span class="hidden sm:inline ml-3 text-sm text-gray-500">Dashboard</span>
          </div>

          <div class="flex items-center space-x-2 sm:space-x-4">
            <div class="hidden sm:flex items-center space-x-3">
              <img v-if="userPhotoURL" :src="userPhotoURL" :alt="userDisplayName"
                class="w-8 h-8 rounded-full ring-2 ring-primary-100">
              <div class="text-sm">
                <p class="font-medium text-gray-900 truncate max-w-32">{{ userDisplayName }}</p>
                <p class="text-gray-500 truncate max-w-32">{{ userEmail }}</p>
              </div>
            </div>

            <!-- Mobile user avatar -->
            <img v-if="userPhotoURL" :src="userPhotoURL" :alt="userDisplayName"
              class="sm:hidden w-8 h-8 rounded-full ring-2 ring-primary-100">

            <button @click="handleSignOut" :disabled="userLoading"
              class="bg-error hover:bg-error/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 shadow-soft hover:shadow-medium">
              <span class="sm:hidden">Sair</span>
              <span class="hidden sm:inline">{{ userLoading ? 'Saindo...' : 'Sair' }}</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600">Carregando fazendas...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800">{{ errorMessage }}</p>
            <button @click="loadFarms" class="mt-2 text-sm text-red-600 hover:text-red-500 underline">
              Tentar novamente
            </button>
          </div>
        </div>
      </div>

      <!-- Welcome section for new users -->
      <div v-else-if="farmsList.length === 0" class="text-center py-12 px-4 animate-fade-in">
        <div
          class="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-primary-600 rounded-full flex items-center justify-center mb-6 shadow-medium animate-bounce-subtle">
          <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
          </svg>
        </div>

        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Bem-vindo ao Demeter!
        </h2>

        <p class="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          Sistema para cálculo de evapotranspiração de referência (ETo) usando o método FAO-56 Penman-Monteith.
          Gerencie suas fazendas e calcule a ETo com dados meteorológicos automáticos de Palmas (TO).
        </p>

        <button @click="goToFarmRegistration"
          class="bg-primary hover:bg-primary-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg text-base sm:text-lg font-medium transition-all duration-200 shadow-soft hover:shadow-medium transform hover:scale-105">
          Cadastrar Primeira Fazenda
        </button>
      </div>

      <!-- Farms section -->
      <div v-else>
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Minhas Fazendas</h2>
            <p class="text-gray-600 mt-1 text-sm sm:text-base">
              {{ farmsList.length }} {{ farmsList.length === 1 ? 'fazenda cadastrada' : 'fazendas cadastradas' }}
            </p>
          </div>

          <button @click="goToFarmRegistration"
            class="bg-primary hover:bg-primary-600 text-white px-4 py-2 sm:px-5 sm:py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center shadow-soft hover:shadow-medium transform hover:scale-105">
            <svg class="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span class="text-sm sm:text-base">Nova Fazenda</span>
          </button>
        </div>

        <!-- Farms grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-fade-in">
          <FarmCard v-for="farm in sortedFarmsList" :key="farm.id" :farm="farm" @select="handleFarmSelect"
            @edit="handleFarmEdit" @delete="handleFarmDelete" @view-history="handleViewHistory" />
        </div>
      </div>
    </main>

    <!-- Delete confirmation modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mt-4">Excluir Fazenda</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Tem certeza que deseja excluir a fazenda "{{ farmToDelete?.name }}"?
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <div class="flex justify-center space-x-4 mt-4">
            <button @click="cancelDelete"
              class="px-4 py-2 bg-gray-300 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300">
              Cancelar
            </button>
            <button @click="confirmDelete" :disabled="deleteLoading"
              class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-400">
              {{ deleteLoading ? 'Excluindo...' : 'Excluir' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../stores/user.js'
import { useFarmsStore } from '../stores/farms.js'
import { navigationHelpers } from '../router/index.js'
import FarmCard from '../components/FarmCard.vue'
import { getUserFarmsCollection } from '../services/firestore.js'
import { getDocs, query, orderBy } from 'firebase/firestore'

const userStore = useUserStore()
const farmsStore = useFarmsStore()

// User data
const userDisplayName = computed(() => userStore.userDisplayName)
const userEmail = computed(() => userStore.userEmail)
const userPhotoURL = computed(() => userStore.userPhotoURL)
const userLoading = computed(() => userStore.loading)

// Local state for farms (bypassing store loading issues)
const farmsList = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

// Delete modal state
const showDeleteModal = ref(false)
const farmToDelete = ref(null)
const deleteLoading = ref(false)

// Computed properties
const sortedFarmsList = computed(() => {
  return [...farmsList.value].sort((a, b) => a.name.localeCompare(b.name))
})

/**
 * Load farms directly from Firestore
 */
const loadFarms = async () => {
  try {
    isLoading.value = true
    errorMessage.value = ''

    const farmsCollection = getUserFarmsCollection()
    const q = query(farmsCollection, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    farmsList.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Also update the store for other components
    farmsStore.farms = farmsList.value
    
  } catch (error) {
    console.error('Failed to load farms:', error)
    errorMessage.value = error.message || 'Erro ao carregar fazendas'
  } finally {
    isLoading.value = false
  }
}

/**
 * Load farms on component mount
 */
onMounted(async () => {
  // Wait for authentication to be ready
  if (userStore.loading) {
    await userStore.waitForAuthInit()
  }

  if (userStore.isAuthenticated) {
    await loadFarms()
  }
})

/**
 * Handle user sign out
 */
const handleSignOut = async () => {
  try {
    await userStore.signOut()
    navigationHelpers.goToLogin()
  } catch (error) {
    console.error('Sign out failed:', error)
  }
}

/**
 * Navigate to farm registration
 */
const goToFarmRegistration = () => {
  navigationHelpers.goToFarmRegistration()
}

/**
 * Handle farm selection for calculation
 */
const handleFarmSelect = (farm) => {
  farmsStore.setCurrentFarm(farm)
  navigationHelpers.goToCalculation(farm.id)
}

/**
 * Handle farm edit
 */
const handleFarmEdit = (farm) => {
  navigationHelpers.goToFarmEdit(farm.id)
}

/**
 * Handle farm delete request
 */
const handleFarmDelete = (farm) => {
  farmToDelete.value = farm
  showDeleteModal.value = true
}

/**
 * Cancel farm deletion
 */
const cancelDelete = () => {
  showDeleteModal.value = false
  farmToDelete.value = null
}

/**
 * Confirm farm deletion
 */
const confirmDelete = async () => {
  if (!farmToDelete.value) return

  try {
    deleteLoading.value = true
    await farmsStore.deleteFarm(farmToDelete.value.id)
    
    // Remove from local list
    farmsList.value = farmsList.value.filter(farm => farm.id !== farmToDelete.value.id)
    
    showDeleteModal.value = false
    farmToDelete.value = null
  } catch (error) {
    console.error('Failed to delete farm:', error)
    errorMessage.value = 'Erro ao excluir fazenda'
  } finally {
    deleteLoading.value = false
  }
}

/**
 * Handle view calculation history
 */
const handleViewHistory = (farm) => {
  navigationHelpers.goToFarmHistory(farm.id)
}
</script>