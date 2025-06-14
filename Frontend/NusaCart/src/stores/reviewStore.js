import { create } from 'zustand';
import { reviewAPI } from '../services/api';

const useReviewStore = create((set, get) => ({
  // State
  reviews: [],
  productReviews: {},  // Store reviews by product ID
  currentReview: null,
  loading: false,
  error: null,
  submitting: false,
  pendingRequests: new Set(), // Track pending requests to avoid duplicates

  // Actions
  setLoading: (loading) => set({ loading }),
  setSubmitting: (submitting) => set({ submitting }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch reviews for a specific product
  fetchReviewsByProduct: async (productId) => {
    // Validate productId parameter
    if (!productId || isNaN(parseInt(productId))) {
      console.error('ReviewStore - Invalid productId:', productId);
      set({ 
        error: `Invalid product ID: ${productId}`,
        loading: false 
      });
      return [];
    }

    const state = get();
    const productIdStr = productId.toString();
    
    // Check if already loaded or request is pending
    if (state.productReviews.hasOwnProperty(productIdStr) || state.pendingRequests.has(productIdStr)) {
      return state.productReviews[productIdStr] || [];
    }
    
    // Add to pending requests
    set(state => ({
      pendingRequests: new Set([...state.pendingRequests, productIdStr]),
      loading: true, 
      error: null
    }));
    
    try {
      const response = await reviewAPI.getByProduct(productId);
      const reviews = response.data || [];
      
      set(state => ({
        productReviews: {
          ...state.productReviews,
          [productIdStr]: reviews
        },
        pendingRequests: new Set([...state.pendingRequests].filter(id => id !== productIdStr)),
        loading: false
      }));
      
      return reviews;
    } catch (error) {
      console.error('ReviewStore - Error fetching reviews:', error);
      set(state => ({
        error: error.response?.data?.message || 'Failed to fetch reviews',
        pendingRequests: new Set([...state.pendingRequests].filter(id => id !== productIdStr)),
        loading: false
      }));
      return [];
    }
  },

  // Create new review
  createReview: async (reviewData) => {
    set({ submitting: true, error: null });
    try {
      // Extract productId and pass it as separate parameter
      const { productId, ...reviewPayload } = reviewData;
      await reviewAPI.create(productId, reviewPayload);
      
      // Force refresh reviews for the product after creating
      if (productId) {
        await get().forceRefreshProductReviews(productId);
      }
      
      set({ submitting: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to create review',
        submitting: false 
      });
      throw error;
    }
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    set({ submitting: true, error: null });
    try {
      await reviewAPI.update(reviewId, reviewData);
      
      // Force refresh reviews for the product after updating
      if (reviewData.productId) {
        await get().forceRefreshProductReviews(reviewData.productId);
      }
      
      set({ submitting: false });
      return true;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update review',
        submitting: false 
      });
      throw error;
    }
  },

  // Force refresh reviews for a product (clear cache and re-fetch)
  forceRefreshProductReviews: async (productId) => {
    const state = get();
    const productIdStr = productId ? productId.toString() : '';
    
    // Clear existing cache for this product
    set(state => ({
      productReviews: {
        ...state.productReviews,
        [productIdStr]: undefined
      },
      pendingRequests: new Set([...state.pendingRequests].filter(id => id !== productIdStr))
    }));
    
    // Force re-fetch
    const result = await get().fetchReviewsByProduct(productId);
    
    return result;
  },

  // Helper function to check if reviews are already loaded for a product
  isProductReviewsLoaded: (productId) => {
    const state = get();
    const productIdStr = productId ? productId.toString() : '';
    return state.productReviews.hasOwnProperty(productIdStr);
  },

  // Get reviews for a specific product
  getReviewsByProduct: (productId) => {
    const state = get();
    const productIdStr = productId ? productId.toString() : '';
    return state.productReviews[productIdStr] || [];
  },

  // Calculate average rating for a product
  getAverageRating: (productId) => {
    const reviews = get().getReviewsByProduct(productId);
    if (reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  },

  // Get rating distribution for a product
  getRatingDistribution: (productId) => {
    const reviews = get().getReviewsByProduct(productId);
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    
    return distribution;
  },

  // Check if current user has already reviewed a product
  hasUserReviewedProduct: (productId, userId) => {
    if (!productId || !userId) return false;
    
    const reviews = get().getReviewsByProduct(productId);
    return reviews.some(review => review.userId === userId);
  },

  // Get user's review for a specific product
  getUserReviewForProduct: (productId, userId) => {
    if (!productId || !userId) return null;
    
    const reviews = get().getReviewsByProduct(productId);
    return reviews.find(review => review.userId === userId) || null;
  },

  // Set current review
  setCurrentReview: (review) => set({ currentReview: review }),

  // Clear current review
  clearCurrentReview: () => set({ currentReview: null }),

  // Clear reviews for a specific product
  clearProductReviews: (productId) => {
    set(state => {
      const newProductReviews = { ...state.productReviews };
      delete newProductReviews[productId];
      return { productReviews: newProductReviews };
    });
  },

  // Reset store
  resetStore: () => set({
    reviews: [],
    productReviews: {},
    currentReview: null,
    loading: false,
    error: null,
    submitting: false
  })
}));

export default useReviewStore; 