import { create } from 'zustand';
import { userAPI, addressAPI, orderAPI, imageAPI } from '../services/api';

const useUserStore = create((set, get) => ({
  profile: null,
  addresses: [],
  orders: [],
  loading: false,
  error: null,
  updating: false,

  // Fetch user profile
  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const response = await userAPI.getProfile();
      set({ profile: response.data, loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch profile',
        loading: false 
      });
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    set({ updating: true, error: null });
    try {
      const response = await userAPI.updateProfile(profileData);
      set({ 
        profile: response.data,
        updating: false,
        error: null
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      set({ 
        error: errorMessage,
        updating: false 
      });
      throw error;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    set({ updating: true, error: null });
    try {
      // Since there's no specific change password endpoint, use update profile
      const response = await userAPI.updateProfile(passwordData);
      set({ updating: false, error: null });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      set({ 
        error: errorMessage,
        updating: false 
      });
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    set({ updating: true, error: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await imageAPI.upload(formData);
      
      // Update profile with new avatar URL
      set((state) => ({
        profile: {
          ...state.profile,
          avatar: response.data.avatarUrl
        },
        updating: false,
        error: null
      }));
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to upload avatar';
      set({ 
        error: errorMessage,
        updating: false 
      });
      throw error;
    }
  },

  // Fetch user addresses
  fetchAddresses: async () => {
    set({ loading: true, error: null });
    try {
      const response = await addressAPI.getAll();
      set({ addresses: response.data || [], loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch addresses',
        loading: false 
      });
    }
  },

  // Add new address
  addAddress: async (addressData) => {
    set({ updating: true, error: null });
    try {
      const response = await addressAPI.create(addressData);
      
      // Refresh addresses
      await get().fetchAddresses();
      
      set({ updating: false, error: null });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add address';
      set({ 
        error: errorMessage,
        updating: false 
      });
      throw error;
    }
  },

  // Update address
  updateAddress: async (addressId, addressData) => {
    set({ updating: true, error: null });
    try {
      const response = await addressAPI.update(addressId, addressData);
      
      // Update local state
      set((state) => ({
        addresses: state.addresses.map(addr => 
          addr.id === addressId ? response.data : addr
        ),
        updating: false,
        error: null
      }));
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update address';
      set({ 
        error: errorMessage,
        updating: false 
      });
      throw error;
    }
  },

  // Delete address
  deleteAddress: async (addressId) => {
    set({ updating: true, error: null });
    try {
      await addressAPI.delete(addressId);
      
      // Remove from local state
      set((state) => ({
        addresses: state.addresses.filter(addr => addr.id !== addressId),
        updating: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete address';
      set({ 
        error: errorMessage,
        updating: false 
      });
      throw error;
    }
  },

  // Set primary address
  setPrimaryAddress: async (addressId) => {
    set({ updating: true, error: null });
    try {
      await addressAPI.setMain(addressId);
      
      // Update local state
      set((state) => ({
        addresses: state.addresses.map(addr => ({
          ...addr,
          isPrimary: addr.id === addressId
        })),
        updating: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to set primary address';
      set({ 
        error: errorMessage,
        updating: false 
      });
      throw error;
    }
  },

  // Fetch user orders
  fetchOrders: async (page = 1, status = null) => {
    set({ loading: true, error: null });
    try {
      const response = await orderAPI.getAll(page, status);
      set({ orders: response.data || [], loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch orders',
        loading: false 
      });
    }
  },

  // Get user statistics
  getStatistics: async () => {
    try {
      // Since there's no specific statistics endpoint, we can calculate from available data
      const [profileResponse, ordersResponse] = await Promise.all([
        userAPI.getProfile(),
        orderAPI.getAll()
      ]);
      
      const statistics = {
        totalOrders: ordersResponse.data?.length || 0,
        profile: profileResponse.data
      };
      
      return statistics;
    } catch (error) {
      console.error('Failed to fetch user statistics:', error);
      return null;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    profile: null,
    addresses: [],
    orders: [],
    loading: false,
    error: null,
    updating: false,
  }),
}));

export default useUserStore; 