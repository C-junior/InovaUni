<template>
  <div class="w-full">
    <button
      @click="handleSignIn"
      :disabled="loading"
      class="w-full bg-primary hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium px-6 py-3 sm:py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-3 shadow-soft hover:shadow-medium transform hover:scale-[1.02] disabled:transform-none disabled:hover:scale-100"
    >
      <svg v-if="!loading" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
      <span class="text-sm sm:text-base">{{ loading ? 'Entrando...' : 'Entrar com Google' }}</span>
    </button>
    
    <div v-if="error" class="mt-4 p-3 bg-error-50 border border-error-200 rounded-lg">
      <div class="flex items-start">
        <svg class="w-4 h-4 text-error-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm text-error-700">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/user.js'
import { useRouter, useRoute } from 'vue-router'
import { navigationHelpers } from '../router/index.js'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const loading = computed(() => userStore.loading)
const error = computed(() => userStore.error)

const handleSignIn = async () => {
  try {
    userStore.clearError()
    await userStore.signInWithGoogle()
    
    // Handle redirect after successful authentication
    const redirectPath = route.query.redirect
    if (redirectPath && redirectPath !== '/login') {
      router.push(redirectPath)
    } else {
      navigationHelpers.goToDashboard()
    }
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>