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
            <span class="hidden sm:inline ml-3 text-sm text-gray-500">Nova Fazenda</span>
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
      <div class="mb-6 sm:mb-8 animate-fade-in">
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Cadastrar Nova Fazenda</h2>
        <p class="text-sm sm:text-base text-gray-600 leading-relaxed">
          Adicione uma nova fazenda para calcular a evapotranspiração de referência (ETo).
        </p>
      </div>

      <FarmForm 
        @success="handleSuccess" 
        @cancel="handleCancel"
      />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { navigationHelpers } from '../router/index.js'
import FarmForm from '../components/FarmForm.vue'

const router = useRouter()
const userStore = useUserStore()

const userDisplayName = computed(() => userStore.userDisplayName)
const userEmail = computed(() => userStore.userEmail)
const userPhotoURL = computed(() => userStore.userPhotoURL)

/**
 * Handle successful farm creation
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