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

  // Actions
  setLoading: (loading) => set({ loading }),
  setSubmitting: (submitting) => set({ submitting }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),

  // Fetch reviews for a specific product
  fetchReviewsByProduct: async (productId) => {
    set({ loading: true, error: null });
    try {
      const response = await reviewAPI.getByProduct(productId);
      const reviews = response.data || [];
      
      set(state => ({
        productReviews: {
          ...state.productReviews,
          [productId]: reviews
        },
        loading: false
      }));
      
      return reviews;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to fetch reviews',
        loading: false 
      });
    }
  },

  // Create new review
  createReview: async (reviewData) => {
    set({ submitting: true, error: null });
    try {
      await reviewAPI.create(reviewData);
      
      // Refresh reviews for the product after creating
      if (reviewData.productId) {
        await get().fetchReviewsByProduct(reviewData.productId);
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
      
      // Refresh reviews for the product after updating
      if (reviewData.productId) {
        await get().fetchReviewsByProduct(reviewData.productId);
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

  // Get reviews for a specific product from state
  getReviewsByProduct: (productId) => {
    const { productReviews } = get();
    return productReviews[productId] || [];
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