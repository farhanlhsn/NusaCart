import { create } from 'zustand';
import { orderAPI } from '../services/api';

const useOrderStore = create((set, get) => ({
  // State
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  orderPlacing: false,

  // Actions
  setLoading: (loading) => set({ loading }),
  setOrderPlacing: (orderPlacing) => set({ orderPlacing }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch all orders for current user
  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await orderAPI.getAll();
      set({
        orders: response.data || [],
        loading: false
      });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch orders',
        loading: false 
      });
    }
  },

  // Place new order
  placeOrder: async (orderData) => {
    set({ orderPlacing: true, error: null });
    try {
      const response = await orderAPI.place(orderData);
      
      // Refresh orders after placing new order
      const ordersResponse = await orderAPI.getAll();
      
      set({
        orders: ordersResponse.data || [],
        orderPlacing: false
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to place order',
        orderPlacing: false 
      });
      throw error;
    }
  },

  // Get order by ID from current orders
  getOrderById: (orderId) => {
    const { orders } = get();
    return orders.find(order => order.id === orderId);
  },

  // Set current order
  setCurrentOrder: (order) => set({ currentOrder: order }),

  // Clear current order
  clearCurrentOrder: () => set({ currentOrder: null }),

  // Update order status locally (when getting updates from tracking/payment)
  updateOrderStatus: (orderId, status) => {
    set(state => ({
      orders: state.orders.map(order => 
        order.id === orderId 
          ? { ...order, orderStatus: status }
          : order
      ),
      currentOrder: state.currentOrder?.id === orderId 
        ? { ...state.currentOrder, orderStatus: status }
        : state.currentOrder
    }));
  },

  // Update payment status locally
  updatePaymentStatus: (orderId, paymentStatus) => {
    set(state => ({
      orders: state.orders.map(order => 
        order.id === orderId 
          ? { ...order, paymentStatus }
          : order
      ),
      currentOrder: state.currentOrder?.id === orderId 
        ? { ...state.currentOrder, paymentStatus }
        : state.currentOrder
    }));
  },

  // Reset store
  resetStore: () => set({
    orders: [],
    currentOrder: null,
    loading: false,
    error: null,
    orderPlacing: false
  })
}));

export default useOrderStore; 