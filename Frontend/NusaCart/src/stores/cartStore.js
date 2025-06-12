import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      products: [],
      checkoutItems: [],
      isLoading: false,
      error: null,

      // Computed values
      getProductsByStore: () => {
        const products = get().products;
        return products.reduce((acc, product) => {
          const storeId = product.store?.id || product.store?.idToko;
          if (!acc[storeId]) {
            acc[storeId] = {
              store: product.store,
              products: []
            };
          }
          acc[storeId].products.push(product);
          return acc;
        }, {});
      },

      getSubtotal: () => {
        const products = get().products;
        return products
          .filter(p => p.checked)
          .reduce((sum, p) => sum + p.price * p.qty, 0);
      },

      getCheckedItems: () => {
        const products = get().products;
        return products.filter(p => p.checked);
      },

      // API Actions
      fetchCartItems: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/api/cart');
          
          // Transform API response to frontend format
          const cartItems = response.data.map(item => ({
            id: item.id,
            name: item.productName,
            desc: item.description || "Produk berkualitas", 
            price: item.price,
            qty: item.quantity,
            checked: false,
            store: {
              id: item.storeId,
              idToko: item.storeId,
              name: item.storeName,
              location: item.storeLocation
            },
            image: item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"
          }));
          
          set({ products: cartItems, isLoading: false });
        } catch (error) {
          console.error('Error fetching cart:', error);
          set({ 
            error: error.response?.data?.message || 'Failed to fetch cart items',
            isLoading: false 
          });
        }
      },

      addProductToCart: async (productId, quantity = 1) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/api/cart', {
            productId: productId,
            quantity: quantity
          });
          
          // Refresh cart after adding
          get().fetchCartItems();
        } catch (error) {
          console.error('Error adding to cart:', error);
          set({ 
            error: error.response?.data?.message || 'Failed to add product to cart',
            isLoading: false 
          });
        }
      },

      removeProductFromCart: async (cartItemId) => {
        set({ isLoading: true, error: null });
        try {
          await api.delete(`/api/cart/${cartItemId}`);
          
          // Remove from local state
          set(state => ({
            products: state.products.filter(p => p.id !== cartItemId),
            isLoading: false
          }));
        } catch (error) {
          console.error('Error removing from cart:', error);
          set({ 
            error: error.response?.data?.message || 'Failed to remove product from cart',
            isLoading: false 
          });
        }
      },

      updateCartItemQuantity: async (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
          // If quantity is 0 or less, remove the item
          return get().removeProductFromCart(cartItemId);
        }

        // For now, we'll update locally since backend doesn't have update endpoint
        // You might want to add PUT /api/cart/{id} endpoint in backend
        set(state => ({
          products: state.products.map(p => 
            p.id === cartItemId ? { ...p, qty: newQuantity } : p
          )
        }));
      },

      // Local Actions (for UI interactions)
      toggleProductCheck: (id) => set((state) => ({
        products: state.products.map(p => 
          p.id === id ? { ...p, checked: !p.checked } : p
        )
      })),

      toggleSelectAll: () => set((state) => {
        const allChecked = state.products.every(p => p.checked);
        return {
          products: state.products.map(p => ({ ...p, checked: !allChecked }))
        };
      }),

      toggleStoreSelection: (storeId) => set((state) => {
        const storeProducts = state.products.filter(p => (p.store?.id || p.store?.idToko) === storeId);
        const allChecked = storeProducts.every(p => p.checked);
        return {
          products: state.products.map(p => 
            (p.store?.id || p.store?.idToko) === storeId ? { ...p, checked: !allChecked } : p
          )
        };
      }),

      updateQuantity: (id, delta) => {
        const currentProduct = get().products.find(p => p.id === id);
        if (currentProduct) {
          const newQuantity = Math.max(1, currentProduct.qty + delta);
          get().updateCartItemQuantity(id, newQuantity);
        }
      },

      removeProduct: (id) => {
        get().removeProductFromCart(id);
      },

      setCheckoutItems: (items) => set({ checkoutItems: items }),

      proceedToCheckout: () => {
        const checkedItems = get().getCheckedItems();
        set({ checkoutItems: checkedItems });
        return checkedItems;
      },

      clearCheckoutItems: () => set({ checkoutItems: [] }),

      // Reset cart
      clearCart: () => set({ products: [], checkoutItems: [] }),

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ 
        products: state.products,
        checkoutItems: state.checkoutItems 
      }),
    }
  )
);

export default useCartStore; 