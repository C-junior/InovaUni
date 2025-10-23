import { defineStore } from 'pinia';
import { 
  signInWithGoogle, 
  signOut, 
  onAuthStateChange 
} from '../services/auth.js';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    userDisplayName: (state) => state.user?.displayName || '',
    userEmail: (state) => state.user?.email || '',
    userPhotoURL: (state) => state.user?.photoURL || '',
    userId: (state) => state.user?.uid || null
  },

  actions: {
    /**
     * Initialize authentication state listener
     */
    initAuth() {
      this.loading = true;
      console.log('🔍 Initializing auth state listener...');
      
      return onAuthStateChange((user) => {
        console.log('🔍 Auth state changed:', user ? 'User logged in' : 'User logged out');
        if (user) {
          console.log('🔍 User details:', { uid: user.uid, email: user.email, displayName: user.displayName });
          this.user = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          };
          this.isAuthenticated = true;
        } else {
          this.user = null;
          this.isAuthenticated = false;
        }
        this.loading = false;
        this.error = null;
        console.log('🔍 Auth state updated - authenticated:', this.isAuthenticated);
      });
    },

    /**
     * Wait for authentication state to be initialized
     */
    async waitForAuthInit() {
      if (!this.loading) return;
      
      return new Promise((resolve) => {
        const unsubscribe = this.$subscribe((_, state) => {
          if (!state.loading) {
            unsubscribe();
            resolve();
          }
        });
      });
    },

    /**
     * Sign in with Google
     */
    async signInWithGoogle() {
      try {
        this.loading = true;
        this.error = null;
        
        const result = await signInWithGoogle();
        
        // User state will be updated by the auth state listener
        return result;
      } catch (error) {
        this.error = error.message;
        this.loading = false;
        throw error;
      }
    },

    /**
     * Sign out current user
     */
    async signOut() {
      try {
        this.loading = true;
        this.error = null;
        
        await signOut();
        
        // User state will be updated by the auth state listener
      } catch (error) {
        this.error = error.message;
        this.loading = false;
        throw error;
      }
    },

    /**
     * Clear any authentication errors
     */
    clearError() {
      this.error = null;
    }
  }
});