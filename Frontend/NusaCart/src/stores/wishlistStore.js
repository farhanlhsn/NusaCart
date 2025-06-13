import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { wishlistAPI } from '../services/api';

const useWishlistStore = create(
  persist(
    (set, get) => ({
      // State
      wishlist: null,
      wishlistItems: [],
      loading: false,
      error: null,
      notification: null,

      // Clear error and notification
      clearError: () => set({ error: null }),
      clearNotification: () => set({ notification: null }),

      // Set notification
      setNotification: (message, type = 'success') => {
        set({ notification: { message, type } });
        setTimeout(() => {
          set({ notification: null });
        }, 3000);
      },

      // Fetch user's wishlist
      fetchWishlist: async (userId) => {
        set({ loading: true, error: null });
        try {
          // Try to get all wishlists - backend might return user's wishlist based on auth
          const response = await wishlistAPI.getAll();
          let wishlistData = null;
          
          // If response is an array, find the current user's wishlist
          if (Array.isArray(response.data)) {
            // If there are multiple wishlists, find the one for this user
            const userWishlist = response.data.find(wishlist => 
              wishlist.userId?.userId === userId
            );
            
            if (userWishlist) {
              wishlistData = userWishlist;
            } else {
              // If no wishlist found, create a mock empty wishlist structure
              wishlistData = {
                wishlistId: null,
                userId: { userId: userId },
                products: []
              };
            }
          } else {
            // If response is a single object, use it directly
            wishlistData = response.data;
          }
          
          set({
            wishlist: wishlistData,
            wishlistItems: wishlistData.products || [],
            loading: false
          });
          
          return wishlistData;
        } catch (error) {
          console.log('Wishlist fetch error:', error);
          
          // If there's a 404 or other error, create empty wishlist structure
          if (error.response?.status === 404 || error.response?.status === 500) {
            const emptyWishlist = {
              wishlistId: null,
              userId: { userId: userId },
              products: []
            };
            
            set({
              wishlist: emptyWishlist,
              wishlistItems: [],
              loading: false,
              error: null // Clear error since we're providing fallback
            });
            
            return emptyWishlist;
          }
          
          const errorMessage = error.response?.data?.message || 'Failed to fetch wishlist';
          set({
            error: errorMessage,
            loading: false,
            notification: { message: 'Wishlist not available, using temporary storage', type: 'info' }
          });
          
          setTimeout(() => set({ notification: null }), 3000);
          
          // Don't throw error, return empty wishlist instead
          const emptyWishlist = {
            wishlistId: null,
            userId: { userId: userId },
            products: []
          };
          
          set({
            wishlist: emptyWishlist,
            wishlistItems: []
          });
          
          return emptyWishlist;
        }
      },

      // Add product to wishlist
      addToWishlist: async (productId) => {
        const { wishlist, wishlistItems } = get();
        
        set({ loading: true, error: null });
        try {
          let currentWishlist = wishlist;
          
          // If no wishlist exists, try to create one first
          if (!currentWishlist || !currentWishlist.wishlistId) {
            try {
              const createResponse = await wishlistAPI.create({
                userId: null, // Let backend handle this from auth context
                products: []
              });
              currentWishlist = createResponse.data;
            } catch (createError) {
              // If creation fails, we might need to get the existing one
              console.log('Failed to create wishlist, trying to fetch existing:', createError);
              const fetchResponse = await wishlistAPI.getAll();
              if (Array.isArray(fetchResponse.data) && fetchResponse.data.length > 0) {
                currentWishlist = fetchResponse.data[0];
              } else {
                throw new Error('Could not create or find wishlist');
              }
            }
          }

          const response = await wishlistAPI.addProduct(currentWishlist.wishlistId, productId);
          const updatedWishlist = response.data;
          
          set({
            wishlist: updatedWishlist,
            wishlistItems: updatedWishlist.products || [],
            loading: false,
            notification: { message: 'Product added to wishlist!', type: 'success' }
          });
          
          setTimeout(() => set({ notification: null }), 3000);
          return updatedWishlist;
        } catch (error) {
          console.log('Add to wishlist error:', error);
          
          // If backend is not available, use local storage as fallback
          if (error.response?.status === 404 || error.response?.status === 500 || !error.response) {
            // Check if product already in local wishlist
            const isAlreadyInWishlist = wishlistItems.some(item => item.productId === productId);
            
            if (!isAlreadyInWishlist) {
              // Add to local storage (mock product data)
              const mockProduct = {
                productId: productId,
                productName: `Product ${productId}`,
                price: 100000,
                stock: 1,
                imageUrls: ['https://via.placeholder.com/400x400/f3f4f6/6b7280?text=Product+' + productId],
                rating: 4.0,
                reviewCount: 0
              };
              
              const updatedItems = [...wishlistItems, mockProduct];
              const updatedWishlist = {
                ...wishlist,
                products: updatedItems
              };
              
              set({
                wishlist: updatedWishlist,
                wishlistItems: updatedItems,
                loading: false,
                notification: { message: 'Product added to local wishlist (backend unavailable)', type: 'info' }
              });
            } else {
              set({
                loading: false,
                notification: { message: 'Product already in wishlist', type: 'info' }
              });
            }
            
            setTimeout(() => set({ notification: null }), 3000);
            return wishlist;
          }
          
          const errorMessage = error.response?.data?.message || 'Failed to add product to wishlist';
          set({
            error: errorMessage,
            loading: false,
            notification: { message: errorMessage, type: 'error' }
          });
          
          setTimeout(() => set({ notification: null }), 3000);
          throw error;
        }
      },

      // Remove product from wishlist
      removeFromWishlist: async (productId) => {
        const { wishlist } = get();
        if (!wishlist || !wishlist.wishlistId) {
          const error = 'Wishlist not found. Please refresh and try again.';
          set({ 
            error,
            notification: { message: error, type: 'error' }
          });
          setTimeout(() => set({ notification: null }), 3000);
          return;
        }

        set({ loading: true, error: null });
        try {
          const response = await wishlistAPI.removeProduct(wishlist.wishlistId, productId);
          const updatedWishlist = response.data;
          
          set({
            wishlist: updatedWishlist,
            wishlistItems: updatedWishlist.products || [],
            loading: false,
            notification: { message: 'Product removed from wishlist!', type: 'success' }
          });
          
          setTimeout(() => set({ notification: null }), 3000);
          return updatedWishlist;
        } catch (error) {
          const errorMessage = error.response?.data?.message || 'Failed to remove product from wishlist';
          set({
            error: errorMessage,
            loading: false,
            notification: { message: errorMessage, type: 'error' }
          });
          
          setTimeout(() => set({ notification: null }), 3000);
          throw error;
        }
      },

      // Check if product is in wishlist
      isInWishlist: (productId) => {
        const { wishlistItems } = get();
        return wishlistItems.some(item => item.productId === productId);
      },

      // Clear wishlist state
      clearWishlist: () => {
        set({
          wishlist: null,
          wishlistItems: [],
          loading: false,
          error: null,
          notification: null
        });
      }
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({ 
        wishlist: state.wishlist,
        wishlistItems: state.wishlistItems 
      }),
    }
  )
);

export default useWishlistStore; 