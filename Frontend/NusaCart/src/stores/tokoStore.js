import { create } from 'zustand';
import { tokoAPI } from '../services/api';

const useTokoStore = create((set, get) => ({
  // State
  stores: [],
  myStores: [],
  currentStore: null,
  searchResults: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    size: 10
  },

  // Actions
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch all stores with pagination
  fetchStores: async (page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await tokoAPI.getAll(page, size);
      const data = response.data;
      
      set({
        stores: data.data || data.content || [],
        pagination: {
          currentPage: data.currentPage || page,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          size: data.size || size
        },
        loading: false
      });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch stores',
        loading: false 
      });
    }
  },

  // Fetch store by ID
  fetchStoreById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await tokoAPI.getById(id);
      set({
        currentStore: response.data,
        loading: false
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch store',
        loading: false 
      });
      throw error;
    }
  },

  // Fetch my stores (for sellers)
  fetchMyStores: async () => {
    set({ loading: true, error: null });
    try {
      const response = await tokoAPI.getMyStores();
      set({
        myStores: response.data || [],
        loading: false
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch my stores',
        loading: false 
      });
    }
  },

  // Search stores by name
  searchStores: async (name, page = 0, size = 10) => {
    set({ loading: true, error: null });
    try {
      const response = await tokoAPI.search(name, page, size);
      const data = response.data;
      
      set({
        searchResults: data.data || data.content || [],
        pagination: {
          currentPage: data.currentPage || page,
          totalPages: data.totalPages || 0,
          totalElements: data.totalElements || 0,
          size: data.size || size
        },
        loading: false
      });
      
      return data.data || data.content || [];
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to search stores',
        loading: false 
      });
    }
  },

  // Create new store
  createStore: async (storeData) => {
    set({ loading: true, error: null });
    try {
      const response = await tokoAPI.create(storeData);
      const newStore = response.data;
      
      set(state => ({
        myStores: [newStore, ...state.myStores],
        loading: false
      }));
      
      return newStore;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create store',
        loading: false 
      });
      throw error;
    }
  },

  // Update store
  updateStore: async (id, storeData) => {
    set({ loading: true, error: null });
    try {
      const response = await tokoAPI.update(id, storeData);
      const updatedStore = response.data.data || response.data;
      
      set(state => ({
        myStores: state.myStores.map(store => 
          store.idToko === id ? updatedStore : store
        ),
        stores: state.stores.map(store => 
          store.idToko === id ? updatedStore : store
        ),
        currentStore: state.currentStore?.idToko === id ? updatedStore : state.currentStore,
        loading: false
      }));
      
      return updatedStore;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update store',
        loading: false 
      });
      throw error;
    }
  },

  // Delete store
  deleteStore: async (id) => {
    set({ loading: true, error: null });
    try {
      await tokoAPI.delete(id);
      
      set(state => ({
        myStores: state.myStores.filter(store => store.idToko !== id),
        stores: state.stores.filter(store => store.idToko !== id),
        currentStore: state.currentStore?.idToko === id ? null : state.currentStore,
        loading: false
      }));
      
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete store',
        loading: false 
      });
      throw error;
    }
  },

  // Clear current store
  clearCurrentStore: () => set({ currentStore: null }),

  // Clear search results
  clearSearchResults: () => set({ searchResults: [] }),
  
  // Reset store
  resetStore: () => set({
    stores: [],
    myStores: [],
    currentStore: null,
    searchResults: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 0,
      totalPages: 0,
      totalElements: 0,
      size: 10
    }
  })
}));

export default useTokoStore; 