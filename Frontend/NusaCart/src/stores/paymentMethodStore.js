import { create } from 'zustand';
import { paymentMethodAPI } from '../services/api';

const usePaymentMethodStore = create((set, get) => ({
  // State
  paymentMethods: [],
  activePaymentMethods: [],
  selectedPaymentMethod: null,
  loading: false,
  error: null,

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch all payment methods
  fetchPaymentMethods: async () => {
    set({ loading: true, error: null });
    try {
      const response = await paymentMethodAPI.getAll();
      const data = response.data;
      
      set({
        paymentMethods: data.data || data || [],
        loading: false
      });
      return data.data || data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch payment methods',
        loading: false 
      });
    }
  },

  // Fetch active payment methods
  fetchActivePaymentMethods: async () => {
    set({ loading: true, error: null });
    try {
      const response = await paymentMethodAPI.getActive();
      const data = response.data;
      
      set({
        activePaymentMethods: data.data || data || [],
        loading: false
      });
      return data.data || data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch active payment methods',
        loading: false 
      });
    }
  },

  // Fetch payment methods by type
  fetchPaymentMethodsByType: async (type) => {
    set({ loading: true, error: null });
    try {
      const response = await paymentMethodAPI.getByType(type);
      const data = response.data;
      
      set({
        loading: false
      });
      return data.data || data || [];
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch payment methods by type',
        loading: false 
      });
      return [];
    }
  },

  // Set selected payment method
  setSelectedPaymentMethod: (paymentMethod) => set({ selectedPaymentMethod: paymentMethod }),

  // Clear selected payment method
  clearSelectedPaymentMethod: () => set({ selectedPaymentMethod: null }),

  // Get payment method by ID
  getPaymentMethodById: (id) => {
    const { paymentMethods, activePaymentMethods } = get();
    return paymentMethods.find(pm => pm.id === id) || 
           activePaymentMethods.find(pm => pm.id === id);
  },

  // Get payment methods by type from current state
  getPaymentMethodsByType: (type) => {
    const { activePaymentMethods } = get();
    return activePaymentMethods.filter(pm => pm.type === type);
  },

  // Reset store
  resetStore: () => set({
    paymentMethods: [],
    activePaymentMethods: [],
    selectedPaymentMethod: null,
    loading: false,
    error: null
  })
}));

export default usePaymentMethodStore; 