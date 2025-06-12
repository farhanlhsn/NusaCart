import { create } from 'zustand';

const useWishlistStore = create((set) => ({
  wishlistItems: [],
  filterCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',
  selectedItems: [],
  viewMode: 'grid',
  showFilters: false,
  notification: null,

  setWishlistItems: (items) => set({ wishlistItems: items }),
  addToWishlist: (item) => set((state) => ({ wishlistItems: [...state.wishlistItems, item] })),
  removeFromWishlist: (id) => set((state) => ({ wishlistItems: state.wishlistItems.filter(i => i.id !== id) })),
  setFilterCategory: (cat) => set({ filterCategory: cat }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setSelectedItems: (arr) => set({ selectedItems: arr }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setShowFilters: (show) => set({ showFilters: show }),
  setNotification: (notif) => set({ notification: notif }),
  clearNotification: () => set({ notification: null }),
}));

export default useWishlistStore; 