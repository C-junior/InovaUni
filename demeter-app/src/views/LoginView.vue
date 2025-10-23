<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 animate-slide-up">
      <!-- Logo/Header Section -->
      <div class="text-center">
        <div
          class="mx-auto  flex items-center justify-center animate-bounce-subtle">
          <img src="/images/logo.png" alt="Demeter Logo" class="w-full h-full object-contain" />
        </div>
        <h1 class="text-3xl sm:text-4xl font-bold text-secondary mb-3">
          Demeter
        </h1>
        <p class="text-base sm:text-lg text-gray-700 mb-2 px-2">
          Cálculo de Evapotranspiração de Referência
        </p>
        <p class="text-sm text-gray-600 font-medium">
          Palmas (TO)
        </p>
      </div>

      <!-- Login Section -->
      <div class="bg-white rounded-xl shadow-strong p-6 sm:p-8 space-y-6 border border-gray-100">
        <div class="text-center">
          <h2 class="text-xl font-semibold text-gray-900 mb-3">
            Bem-vindo
          </h2>
          <p class="text-sm text-gray-600 mb-6 px-2">
            Faça login com sua conta Google para acessar o sistema
          </p>

          <GoogleLoginButton />
        </div>

        <div class="border-t border-gray-100 pt-4">
          <p class="text-xs text-gray-500 text-center leading-relaxed">
            Sistema desenvolvido para produtores e técnicos agrícolas
          </p>
        </div>
      </div>

      <!-- Additional Info -->
      <div class="text-center">
        <p class="text-xs text-gray-500">
          Método FAO-56 Penman-Monteith • Dados meteorológicos automáticos
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import GoogleLoginButton from '../components/GoogleLoginButton.vue'
</script>