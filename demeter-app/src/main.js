import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Initialize Firebase (imported for side effects)
import './firebase.js'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize authentication state before mounting
import { useUserStore } from './stores/user.js'

// Wait for auth state to be initialized before mounting the app
const userStore = useUserStore()
userStore.initAuth()

// Add some debugging
console.log('🔍 App initializing...')
console.log('🔍 User store initialized')

app.mount('#app')
