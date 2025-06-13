import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, userAPI } from '../services/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      user: null,
      token: null,
      loading: false,
      error: null,

      login: async (credentials) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.login(credentials);
          const { token, user } = response.data;
          
          // Store token in localStorage
          localStorage.setItem('token', token);
          
          set({
            isLoggedIn: true,
            user: user,
            token: token,
            loading: false,
            error: null
          });
          
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ 
            loading: false, 
            error: errorMessage,
            isLoggedIn: false,
            user: null,
            token: null
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.register(userData);
          set({ loading: false, error: null });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Call backend logout if needed
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        // Clear local storage
        localStorage.removeItem('token');
        
        set({
          isLoggedIn: false,
          user: null,
          token: null,
          loading: false,
          error: null
        });
      },

      forgotPassword: async (email) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.forgotPassword({ email });
          set({ loading: false, error: null });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to send reset email';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ loading: true, error: null });
        try {
          const response = await authAPI.resetPassword({ token, newPassword });
          set({ loading: false, error: null });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to reset password';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      updateProfile: async (profileData) => {
        set({ loading: true, error: null });
        try {
          const response = await userAPI.updateProfile(profileData);
          set({ 
            user: response.data,
            loading: false,
            error: null
          });
          return response.data;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to update profile';
          set({ loading: false, error: errorMessage });
          throw error;
        }
      },

      refreshUser: async () => {
        if (!get().token) return;
        
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
          // If token is invalid, logout
          get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'userLoginStatus',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        user: state.user,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;
