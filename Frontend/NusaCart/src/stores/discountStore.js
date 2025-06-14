import { create } from 'zustand';
import { discountAPI } from '../services/api';

const useDiscountStore = create((set, get) => ({
  // State
  appliedDiscount: null,
  discountValidation: null,
  loading: false,
  error: null,
  validating: false,

  // Actions
  setLoading: (loading) => set({ loading }),
  setValidating: (validating) => set({ validating }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Validate and apply promo code
  validatePromoCode: async (promoCode) => {
    set({ validating: true, error: null, discountValidation: null });
    try {
      const response = await discountAPI.getByCode(promoCode);
      // Backend returns: { message: "...", data: DiscountDTO }
      const discount = response.data.data;
      
      set({
        discountValidation: discount,
        validating: false
      });
      
      return { data: discount }; // Return in consistent format
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Invalid promo code',
        validating: false,
        discountValidation: null
      });
      throw error;
    }
  },

  // Apply validated discount
  applyDiscount: (discount) => {
    if (!discount) return;
    
    set({
      appliedDiscount: discount,
      discountValidation: null,
      error: null
    });
  },

  // Remove applied discount
  removeDiscount: () => {
    set({
      appliedDiscount: null,
      discountValidation: null,
      error: null
    });
  },

  // Calculate discount amount
  calculateDiscountAmount: (subtotal) => {
    const { appliedDiscount } = get();
    if (!appliedDiscount || !appliedDiscount.valid) return 0;
    
    return (subtotal * appliedDiscount.discountPercentage) / 100;
  },

  // Get final total after discount
  getFinalTotal: (subtotal) => {
    const discountAmount = get().calculateDiscountAmount(subtotal);
    return subtotal - discountAmount;
  },

  // Check if discount is still valid
  isDiscountValid: () => {
    const { appliedDiscount } = get();
    if (!appliedDiscount) return false;
    
    const now = new Date();
    const validUntil = new Date(appliedDiscount.validUntil);
    
    return appliedDiscount.valid && now <= validUntil;
  },

  // Create new discount (for sellers/admin)
  createDiscount: async (discountData) => {
    set({ loading: true, error: null });
    try {
      await discountAPI.create(discountData);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create discount',
        loading: false 
      });
      throw error;
    }
  },

  // Update discount (for sellers/admin)
  updateDiscount: async (promoCode, discountData) => {
    set({ loading: true, error: null });
    try {
      await discountAPI.update(promoCode, discountData);
      set({ loading: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update discount',
        loading: false 
      });
      throw error;
    }
  },

  // Clear validation state
  clearValidation: () => set({ 
    discountValidation: null, 
    error: null 
  }),

  // Reset store
  resetStore: () => set({
    appliedDiscount: null,
    discountValidation: null,
    loading: false,
    error: null,
    validating: false
  })
}));

export default useDiscountStore; 