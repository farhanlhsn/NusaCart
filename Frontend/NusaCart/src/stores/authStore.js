import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, userAPI } from '../services/api';
import { proactiveTokenRefresh } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          
          // Check if user is verified before saving to store
          const isUserVerified = response.data.verified !== undefined ? response.data.verified : response.data.user?.verified;
          
          if (isUserVerified) {
            // Only save user data and set logged in if user is verified
            set({
              user: response.data.user,
              isLoggedIn: true,
              loading: false,
              error: null
            });
          } else {
            // For unverified users, don't save to store, just clear loading state
            set({
              loading: false,
              error: null,
              isLoggedIn: false,
              user: null
            });
          }
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login gagal';
          set({
            error: errorMessage,
            loading: false,
            isLoggedIn: false,
            user: null
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          set({
            loading: false,
            error: null
          });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Registrasi gagal';
          set({
            error: errorMessage,
            loading: false
          });
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
          // Continue with logout even if API call fails
        } finally {
          // Clear all auth state
          set({
            user: null,
            isLoggedIn: false,
            loading: false,
            error: null
          });
          
          // Clear localStorage
          localStorage.removeItem('userLoginStatus');
          sessionStorage.clear();
        }
      },

      // Manual refresh token function
      refreshToken: async () => {
        if (!get().isLoggedIn) {
          console.log('[Auth Store] User not logged in, skipping refresh');
          return false;
        }

        try {
          console.log('[Auth Store] Manually refreshing token...');
          await proactiveTokenRefresh();
          
          // Optionally refresh user data after token refresh
          await get().refreshUser();
          
          console.log('[Auth Store] Manual token refresh successful');
          return true;
        } catch (error) {
          console.error('[Auth Store] Manual token refresh failed:', error);
          
          // If refresh fails, logout user
          if (error.response?.status === 401) {
            console.log('[Auth Store] Refresh token expired, logging out user');
            await get().logout();
          }
          
          return false;
        }
      },

      // Check if user session is still valid
      checkAuthStatus: async () => {
        if (!get().isLoggedIn) return false;

        try {
          // Try to get user profile to verify session
          const response = await userAPI.getProfile();
          set({ 
            user: response.data,
            error: null
          });
          return true;
        } catch (error) {
          console.error('[Auth Store] Auth status check failed:', error);
          
          // If 401, try to refresh token
          if (error.response?.status === 401) {
            console.log('[Auth Store] Session invalid, attempting refresh...');
            return await get().refreshToken();
          }
          
          return false;
        }
      },

      refreshUser: async () => {
        if (!get().isLoggedIn) return;
        
        set({ loading: true });
        try {
          const response = await userAPI.getProfile();
          set({ 
            user: response.data,
            loading: false,
            error: null
          });
        } catch (error) {
          console.error('Failed to refresh user:', error);
          set({ loading: false });
          
          // If cookies are invalid, try refresh first
          if (error.response?.status === 401) {
            const refreshSuccess = await get().refreshToken();
            if (!refreshSuccess) {
              // If refresh fails, logout
              get().logout();
            }
          }
        }
      },

      clearError: () => set({ error: null }),

      // Update user data in store (for profile updates)
      updateUser: (userData) => {
        const currentState = get();
        if (currentState.isLoggedIn) {
          set({
            user: {
              ...currentState.user,
              ...userData
            }
          });
        }
      },
    }),
    {
      name: 'userLoginStatus',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        // Don't persist token since we use cookie-based auth
      }),
    }
  )
);

// Set up periodic auth status check (every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(async () => {
    const store = useAuthStore.getState();
    if (store.isLoggedIn) {
      console.log('[Auth Store] Periodic auth status check...');
      const isValid = await store.checkAuthStatus();
      if (!isValid) {
        console.log('[Auth Store] Auth status check failed, user may be logged out');
      }
    }
  }, 5 * 60 * 1000); // 5 minutes
}

export default useAuthStore;
