import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user.js'
import { useFarmsStore } from '../stores/farms.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { 
        requiresGuest: true,
        title: 'Login - Demeter'
      }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { 
        requiresAuth: true,
        title: 'Dashboard - Demeter'
      }
    },
    {
      path: '/farm/new',
      name: 'farm-registration',
      component: () => import('../views/FarmRegistrationView.vue'),
      meta: { 
        requiresAuth: true,
        title: 'Nova Fazenda - Demeter'
      }
    },
    {
      path: '/farm/edit/:id',
      name: 'farm-edit',
      component: () => import('../views/FarmEditView.vue'),
      meta: { 
        requiresAuth: true,
        title: 'Editar Fazenda - Demeter',
        validateFarmAccess: true
      }
    },
    {
      path: '/calc/:farmId',
      name: 'calculation',
      component: () => import('../views/CalcView.vue'),
      meta: { 
        requiresAuth: true,
        title: 'Cálculo ETo - Demeter',
        validateFarmAccess: true
      }
    },
    {
      path: '/farm/:farmId/history',
      name: 'farm-history',
      component: () => import('../views/FarmHistoryView.vue'),
      meta: { 
        requiresAuth: true,
        title: 'Histórico - Demeter',
        validateFarmAccess: true
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: '/dashboard'
    }
  ],
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // Wait for auth state to be initialized if still loading
  if (userStore.loading) {
    try {
      await userStore.waitForAuthInit()
    } catch (error) {
      console.error('Auth initialization failed:', error)
      next('/login')
      return
    }
  }
  
  // Handle navigation logic
  const result = await handleNavigation(to, from, userStore)
  
  if (result === true) {
    next()
  } else if (typeof result === 'string') {
    next(result)
  } else if (typeof result === 'object') {
    next(result)
  } else {
    next(false)
  }
})

// After each navigation, update document title
router.afterEach((to) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
})

async function handleNavigation(to, from, userStore) {
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!userStore.isAuthenticated) {
      // Store the intended destination for redirect after login
      const redirectPath = to.fullPath !== '/dashboard' ? to.fullPath : null
      return {
        path: '/login',
        query: redirectPath ? { redirect: redirectPath } : {}
      }
    }
    
    // Validate farm access for routes that require it
    if (to.meta.validateFarmAccess && (to.params.farmId || to.params.id)) {
      const farmId = to.params.farmId || to.params.id
      const farmsStore = useFarmsStore()
      
      try {
        // Check if user has access to this farm
        const farm = await farmsStore.getFarm(farmId)
        if (!farm) {
          console.warn(`Farm ${farmId} not found or access denied`)
          return '/dashboard'
        }
        
        // Set current farm in store for easy access
        farmsStore.setCurrentFarm(farm)
      } catch (error) {
        console.error('Farm validation failed:', error)
        return '/dashboard'
      }
    }
  }
  
  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest) {
    if (userStore.isAuthenticated) {
      // Check if there's a redirect query parameter from login
      const redirectPath = to.query.redirect
      if (redirectPath && redirectPath !== '/login') {
        return redirectPath
      }
      return '/dashboard'
    }
  }
  
  return true
}

// Navigation helper methods
export const navigationHelpers = {
  /**
   * Navigate to login with optional redirect
   */
  goToLogin(redirectPath = null) {
    const query = redirectPath ? { redirect: redirectPath } : {}
    return router.push({ name: 'login', query })
  },

  /**
   * Navigate to dashboard
   */
  goToDashboard() {
    return router.push({ name: 'dashboard' })
  },

  /**
   * Navigate to farm registration
   */
  goToFarmRegistration() {
    return router.push({ name: 'farm-registration' })
  },

  /**
   * Navigate to farm edit
   */
  goToFarmEdit(farmId) {
    return router.push({ name: 'farm-edit', params: { id: farmId } })
  },

  /**
   * Navigate to calculation view
   */
  goToCalculation(farmId) {
    return router.push({ name: 'calculation', params: { farmId } })
  },

  /**
   * Navigate to farm history
   */
  goToFarmHistory(farmId) {
    return router.push({ name: 'farm-history', params: { farmId } })
  },

  /**
   * Go back to previous route or dashboard as fallback
   */
  goBack() {
    if (window.history.length > 1) {
      router.back()
    } else {
      this.goToDashboard()
    }
  },

  /**
   * Handle authentication redirect after login
   */
  handleAuthRedirect() {
    const redirectPath = router.currentRoute.value.query.redirect
    if (redirectPath && redirectPath !== '/login') {
      return router.push(redirectPath)
    }
    return this.goToDashboard()
  }
}

export default router
