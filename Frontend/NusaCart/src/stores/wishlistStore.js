import { create } from 'zustand';
import { wishlistAPI } from '../services/api';

const useWishlistStore = create((set, get) => ({
  wishlistItems: [],
  loading: false,
  error: null,
  filterCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',
  selectedItems: [],
  viewMode: 'grid',
  showFilters: false,
  notification: null,

  // Fetch user's wishlist
  fetchWishlist: async () => {
    set({ loading: true, error: null });
    try {
      const response = await wishlistAPI.getAll();
      set({ wishlistItems: response.data || [], loading: false });
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch wishlist',
        loading: false 
      });
    }
  },

  // Add item to wishlist
  addToWishlist: async (productId) => {
    set({ loading: true, error: null });
    try {
      const response = await wishlistAPI.create({ productId });
      
      // Refresh wishlist to get updated data
      await get().fetchWishlist();
      
      set({ 
        loading: false,
        notification: { type: 'success', message: 'Item added to wishlist!' }
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        set({ notification: null });
      }, 3000);
      
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add to wishlist';
      set({ 
        error: errorMessage,
        loading: false,
        notification: { type: 'error', message: errorMessage }
      });
      
      setTimeout(() => {
        set({ notification: null });
      }, 3000);
      
      throw error;
    }
  },

  // Remove item from wishlist
  removeFromWishlist: async (productId) => {
    set({ loading: true, error: null });
    try {
      await wishlistAPI.delete(productId);
      
      // Update local state immediately for better UX
      set((state) => ({
        wishlistItems: state.wishlistItems.filter(item => item.product?.id !== productId),
        loading: false,
        notification: { type: 'success', message: 'Item removed from wishlist!' }
      }));
      
      setTimeout(() => {
        set({ notification: null });
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove from wishlist';
      set({ 
        error: errorMessage,
        loading: false,
        notification: { type: 'error', message: errorMessage }
      });
      
      setTimeout(() => {
        set({ notification: null });
      }, 3000);
    }
  },

  // Check if product is in wishlist
  isInWishlist: (productId) => {
    const { wishlistItems } = get();
    return wishlistItems.some(item => item.product?.id === productId);
  },

  // Move item from wishlist to cart
  moveToCart: async (productId, cartStore) => {
    try {
      // Find the wishlist item
      const { wishlistItems } = get();
      const wishlistItem = wishlistItems.find(item => item.product?.id === productId);
      
      if (!wishlistItem) {
        throw new Error('Item not found in wishlist');
      }

      // Add to cart
      await cartStore.addToCart(productId, 1);
      
      // Remove from wishlist
      await get().removeFromWishlist(productId);
      
      set({
        notification: { type: 'success', message: 'Item moved to cart!' }
      });
      
      setTimeout(() => {
        set({ notification: null });
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to move item to cart';
      set({
        notification: { type: 'error', message: errorMessage }
      });
      
      setTimeout(() => {
        set({ notification: null });
      }, 3000);
    }
  },

  // Clear all wishlist items
  clearWishlist: async () => {
    set({ loading: true, error: null });
    try {
      await wishlistAPI.deleteAll();
      set({ 
        wishlistItems: [], 
        loading: false,
        notification: { type: 'success', message: 'Wishlist cleared!' }
      });
      
      setTimeout(() => {
        set({ notification: null });
      }, 3000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to clear wishlist';
      set({ 
        error: errorMessage,
        loading: false,
        notification: { type: 'error', message: errorMessage }
      });
      
      setTimeout(() => {
        set({ notification: null });
      }, 3000);
    }
  },

  // Filter and search functionality
  getFilteredItems: () => {
    const { wishlistItems, filterCategory, searchQuery, sortBy } = get();
    
    let filtered = [...wishlistItems];
    
    // Filter by category
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => 
        item.product?.category?.name?.toLowerCase() === filterCategory.toLowerCase()
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(item =>
        item.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.product?.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort items
    switch (sortBy) {
      case 'name-asc':
        filtered.sort((a, b) => a.product?.name?.localeCompare(b.product?.name));
        break;
      case 'name-desc':
        filtered.sort((a, b) => b.product?.name?.localeCompare(a.product?.name));
        break;
      case 'price-asc':
        filtered.sort((a, b) => (a.product?.price || 0) - (b.product?.price || 0));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b.product?.price || 0) - (a.product?.price || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }
    
    return filtered;
  },

  // UI state setters
  setFilterCategory: (category) => set({ filterCategory: category }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSelectedItems: (items) => set({ selectedItems: items }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setShowFilters: (show) => set({ showFilters: show }),
  clearNotification: () => set({ notification: null }),
  clearError: () => set({ error: null }),
}));

export default useWishlistStore; 