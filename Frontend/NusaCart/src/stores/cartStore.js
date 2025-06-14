import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartAPI, orderAPI } from '../services/api';

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

      // Clear error
      clearError: () => set({ error: null }),

      // API Actions
      fetchCartItems: async () => {
        const currentState = get();
        if (currentState.isLoading) return; // Prevent concurrent calls
        
        set({ isLoading: true, error: null });
        try {
          const response = await cartAPI.get();
          
          // Get unique store IDs from cart items
          const storeIds = [...new Set(response.data.map(item => item.storeId))];
          
          // Fetch store details for each unique store
          const storePromises = storeIds.map(async (storeId) => {
            try {
              const storeResponse = await fetch(`http://localhost:6060/api/toko/${storeId}`);
              if (storeResponse.ok) {
                return await storeResponse.json();
              }
              return null;
            } catch (error) {
              console.error(`Error fetching store ${storeId}:`, error);
              return null;
            }
          });
          
          const storeResults = await Promise.all(storePromises);
          const storeMap = {};
          
          // Create a map of store data
          storeResults.forEach((storeData, index) => {
            if (storeData) {
              storeMap[storeIds[index]] = storeData;
            }
          });
          
          // Transform API response to frontend format with store data
          const cartItems = response.data.map(item => ({
            id: item.id, // This is cart item ID
            productId: item.productId, // This is product ID
            name: item.productName,
            price: item.price,
            qty: item.quantity,
            checked: false,
            store: {
              id: item.storeId,
              idToko: item.storeId,
              name: item.storeName,
              location: item.storeLocation,
              profilePictureToko: storeMap[item.storeId]?.profilePictureToko || null
            },
            image: item.imageUrl 
              ? (item.imageUrl.startsWith('http') 
                 ? item.imageUrl 
                 : `http://localhost:6060${item.imageUrl}`)
              : "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80"
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
          const response = await cartAPI.add({
            productId: productId,
            quantity: quantity
          });
          
          // If successful, just refresh cart to get updated data
          // This is acceptable as adding new products is less frequent than updating quantity
          await get().fetchCartItems();
        } catch (error) {
          console.error('Error adding to cart:', error);
          set({ 
            error: error.response?.data?.message || 'Failed to add product to cart',
            isLoading: false 
          });
        }
      },

      removeProductFromCart: async (cartItemId) => {
        // Update local state immediately for better UX
        set(state => ({
          products: state.products.filter(p => p.id !== cartItemId)
        }));

        try {
          await cartAPI.remove(cartItemId);
        } catch (error) {
          console.error('Error removing from cart:', error);
          
          // Revert by fetching fresh data if API fails
          get().fetchCartItems();
          
          set({ 
            error: error.response?.data?.message || 'Failed to remove product from cart'
          });
        }
      },

      updateCartItemQuantity: async (cartItemId, newQuantity) => {
        if (newQuantity < 1) {
          // If quantity is 0 or less, remove the item
          return get().removeProductFromCart(cartItemId);
        }

        // Update local state immediately for better UX
        set(state => ({
          products: state.products.map(p => 
            p.id === cartItemId ? { ...p, qty: newQuantity } : p
          )
        }));

        try {
          // Update in backend without showing loading state
          await cartAPI.updateQuantity(cartItemId, newQuantity);
        } catch (error) {
          console.error('Error updating cart quantity:', error);
          
          // Revert the local change if API fails
          const originalProduct = get().products.find(p => p.id === cartItemId);
          if (originalProduct) {
            // Fetch fresh data to revert to correct state
            get().fetchCartItems();
          }
          
          set({ 
            error: error.response?.data?.message || 'Failed to update cart quantity'
          });
        }
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

      // Update quantity for checkout items (local state only, no API call)
      updateCheckoutQuantity: (id, delta) => set((state) => ({
        checkoutItems: state.checkoutItems.map(item => {
          if (item.id === id) {
            const newQuantity = Math.max(1, item.qty + delta);
            return { ...item, qty: newQuantity };
          }
          return item;
        })
      })),

      removeProduct: (id) => {
        get().removeProductFromCart(id);
      },

      setCheckoutItems: (items) => set({ checkoutItems: items }),

      proceedToCheckout: () => {
        const checkedItems = get().getCheckedItems();
        set({ checkoutItems: checkedItems });
        return checkedItems;
      },

      createOrder: async (orderData) => {
        set({ isLoading: true, error: null });
        try {
          // Transform checkout items to order format
          const orderItems = get().checkoutItems.map(item => ({
            productId: item.productId || item.id, // Use productId if available, fallback to id
            quantity: item.qty
          }));
          
          const orderPayload = {
            address: orderData.address,
            addressId: orderData.addressId,
            paymentMethodId: orderData.paymentMethodId,
            items: orderItems,
            ...(orderData.promoCode && { promoCode: orderData.promoCode })
          };
          
          console.log('CartStore sending order payload:', orderPayload);
          
          const response = await orderAPI.place(orderPayload);
          
          // Clear checkout items and refresh cart after successful order
          set({ checkoutItems: [], isLoading: false });
          get().fetchCartItems(); // Refresh cart to remove ordered items
          
          return response.data;
        } catch (error) {
          console.error('Error creating order:', error);
          set({ 
            error: error.response?.data?.message || 'Failed to create order',
            isLoading: false 
          });
          throw error;
        }
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