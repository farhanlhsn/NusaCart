import { create } from 'zustand';
import { trackingAPI } from '../services/api';

const useTrackingStore = create((set, get) => ({
  // State
  trackingData: {},  // Store tracking by order ID
  currentTracking: [],
  loading: false,
  error: null,
  addingTracking: false,

  // Actions
  setLoading: (loading) => set({ loading }),
  setAddingTracking: (addingTracking) => set({ addingTracking }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch tracking for a specific order
  fetchTrackingByOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const response = await trackingAPI.getByOrder(orderId);
      const tracking = response.data || [];
      
      set(state => ({
        trackingData: {
          ...state.trackingData,
          [orderId]: tracking
        },
        currentTracking: tracking,
        loading: false
      }));
      
      return tracking;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch tracking',
        loading: false 
      });
    }
  },

  // Add tracking info (for sellers/admin)
  addTracking: async (orderId, trackingInfo) => {
    set({ addingTracking: true, error: null });
    try {
      await trackingAPI.add(orderId, trackingInfo);
      
      // Refresh tracking for the order after adding
      await get().fetchTrackingByOrder(orderId);
      
      set({ addingTracking: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to add tracking',
        addingTracking: false 
      });
      throw error;
    }
  },

  // Get tracking for a specific order from state
  getTrackingByOrder: (orderId) => {
    const { trackingData } = get();
    return trackingData[orderId] || [];
  },

  // Get latest tracking status for an order
  getLatestStatus: (orderId) => {
    const tracking = get().getTrackingByOrder(orderId);
    if (tracking.length === 0) return null;
    
    // Sort by updatedAt descending and get the latest
    const sortedTracking = [...tracking].sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    
    return sortedTracking[0];
  },

  // Get tracking timeline for an order (sorted by date)
  getTrackingTimeline: (orderId) => {
    const tracking = get().getTrackingByOrder(orderId);
    
    // Sort by updatedAt ascending for timeline display
    return [...tracking].sort((a, b) => 
      new Date(a.updatedAt) - new Date(b.updatedAt)
    );
  },

  // Set current tracking
  setCurrentTracking: (tracking) => set({ currentTracking: tracking }),

  // Clear current tracking
  clearCurrentTracking: () => set({ currentTracking: [] }),

  // Clear tracking for a specific order
  clearOrderTracking: (orderId) => {
    set(state => {
      const newTrackingData = { ...state.trackingData };
      delete newTrackingData[orderId];
      return { trackingData: newTrackingData };
    });
  },

  // Add tracking locally (for real-time updates)
  addTrackingLocally: (orderId, trackingItem) => {
    set(state => {
      const currentOrderTracking = state.trackingData[orderId] || [];
      const updatedTracking = [...currentOrderTracking, trackingItem];
      
      return {
        trackingData: {
          ...state.trackingData,
          [orderId]: updatedTracking
        },
        currentTracking: state.currentTracking.length > 0 ? updatedTracking : state.currentTracking
      };
    });
  },

  // Reset store
  resetStore: () => set({
    trackingData: {},
    currentTracking: [],
    loading: false,
    error: null,
    addingTracking: false
  })
}));

export default useTrackingStore; 