import { useState, useEffect } from 'react';
import useReviewStore from '../stores/reviewStore';
import useAuthStore from '../stores/authStore';
import useOrderStore from '../stores/orderStore';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';

const ReviewSection = ({ productId }) => {
  const [showReviews, setShowReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [toast, setToast] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingDistribution, setRatingDistribution] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  const { 
    fetchReviewsByProduct,
    createReview,
    updateReview,
    getReviewsByProduct,
    getAverageRating,
    getRatingDistribution,
    forceRefreshProductReviews,
    loading,
    submitting,
    error,
    clearError,
    lastUpdated
  } = useReviewStore();
  
  const { user } = useAuthStore();
  const { orders } = useOrderStore();

  const [canReview, setCanReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchReviewsByProduct(productId);
    }
  }, [productId, fetchReviewsByProduct]);

  useEffect(() => {
    // Check if user can review this product (must have purchased and received it)
    if (user && orders.length > 0) {
      const hasPurchased = orders.some(order =>
        order.items?.some(item => item.productId === productId) &&
        order.orderStatus === 'DELIVERED'
      );
      setCanReview(hasPurchased);
    } else {
      setCanReview(false);
    }
  }, [user, orders, productId]);

  // Effect to update local state when store changes
  useEffect(() => {
    if (productId) {
      const storeReviews = getReviewsByProduct(productId);
      const storeAverageRating = getAverageRating(productId);
      const storeRatingDistribution = getRatingDistribution(productId);
      
      setReviews(storeReviews);
      setAverageRating(storeAverageRating);
      setRatingDistribution(storeRatingDistribution);
      
      // Check if user has reviewed
      if (user) {
        const userReview = storeReviews.find(review => review.userId === user.userId);
        setHasReviewed(!!userReview);
        
        if (userReview) {
          setEditingReview(userReview);
        } else {
          setEditingReview(null);
        }
      }
    }
  }, [productId, user, getReviewsByProduct, getAverageRating, getRatingDistribution, lastUpdated]);

  // Toast notification component
  const Toast = ({ message, type = 'success' }) => {
    useEffect(() => {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }, []);

    return (
      <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        <div className="flex items-center space-x-2">
          <span>
            {type === 'success' ? '✓' : '✗'}
          </span>
          <span>{message}</span>
        </div>
      </div>
    );
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingWidth = (rating) => {
    const total = reviews.length;
    if (total === 0) return '0%';
    return `${(ratingDistribution[rating] / total) * 100}%`;
  };

  const getRatingText = (rating) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4) return 'Very Good';
    if (rating >= 3) return 'Good';
    if (rating >= 2) return 'Fair';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="mt-12 border-t pt-8">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading reviews...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t pt-8">
      {/* Review Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Customer Reviews
            {refreshing && (
              <span className="ml-2 text-sm text-blue-600">
                <svg className="inline animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            )}
          </h2>
                     {reviews.length > 0 && (
             <div className={`flex items-center space-x-2 transition-all duration-300 ${
               refreshing ? 'opacity-50' : 'opacity-100'
             }`}>
               <StarRating rating={Math.round(averageRating)} />
               <span className="text-lg font-medium text-gray-900">
                 {averageRating.toFixed(1)}
               </span>
               <span className="text-sm text-gray-600">
                 ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
               </span>
             </div>
           )}
        </div>
        
        <button
          onClick={() => setShowReviews(!showReviews)}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          {showReviews ? 'Hide Reviews' : 'Show Reviews'}
        </button>
      </div>

      {showReviews && (
        <div className="space-y-6">
          {/* Rating Summary */}
          {reviews.length > 0 && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Average Rating */}
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {averageRating.toFixed(1)}
                  </div>
                                     <div className="flex justify-center mb-2">
                     <StarRating rating={Math.round(averageRating)} size="lg" />
                   </div>
                  <p className="text-gray-600 font-medium">
                    {getRatingText(averageRating)}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900 mb-3">Rating Distribution</h4>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 w-8">{rating}★</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: getRatingWidth(rating) }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8">
                        {ratingDistribution[rating]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Write/Edit Review Section */}
          {user && canReview && (
            <div className="border-t pt-6">
              {!showReviewForm ? (
                <button
                                     onClick={() => setShowReviewForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  {hasReviewed ? 'Edit Your Review' : 'Write a Review'}
                </button>
                             ) : (
                 <ReviewForm
                   productId={productId}
                   initialReview={editingReview}
                   onSuccess={async (result) => {
                     setShowReviewForm(false);
                     setEditingReview(null);
                     setRefreshing(true);
                     
                     // Show success message
                     showToast(
                       result.action === 'updated' 
                         ? 'Review updated successfully!' 
                         : 'Review submitted successfully!',
                       'success'
                     );
                     
                     // Force refresh to ensure UI updates immediately
                     try {
                       // Small delay to ensure backend has processed the update
                       await new Promise(resolve => setTimeout(resolve, 300));
                       
                       // Update local state from store
                       const storeReviews = getReviewsByProduct(productId);
                       const storeAverageRating = getAverageRating(productId);
                       const storeRatingDistribution = getRatingDistribution(productId);
                       
                       setReviews(storeReviews);
                       setAverageRating(storeAverageRating);
                       setRatingDistribution(storeRatingDistribution);
                       
                       // Update user review status
                       if (user) {
                         const userReview = storeReviews.find(review => review.userId === user.userId);
                         setHasReviewed(!!userReview);
                         if (userReview) {
                           setEditingReview(userReview);
                         }
                       }
                       
                       setRefreshing(false);
                     } catch (error) {
                       console.error('Error refreshing reviews:', error);
                       setRefreshing(false);
                     }git 
                   }}
                   onCancel={() => {
                     setShowReviewForm(false);
                     setEditingReview(null);
                   }}
                 />
               )}
            </div>
          )}

          {/* Login prompt */}
          {!user && (
            <div className="border-t pt-6">
              <p className="text-gray-600">
                <a href="/login" className="text-blue-600 hover:text-blue-700">
                  Login
                </a> to write a review
              </p>
            </div>
          )}

          {/* Purchase required prompt */}
          {user && !canReview && (
            <div className="border-t pt-6">
              <p className="text-gray-600">
                You can only review products you have purchased and received.
              </p>
            </div>
          )}

          {/* Reviews List */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Reviews
            </h3>
            
            {reviews.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No reviews yet. Be the first to review this product!
              </p>
            ) : (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.reviewId} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-medium">
                          {review.userId?.toString().slice(-2) || 'U'}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                                                     <div className="flex items-center space-x-3 mb-2">
                             <StarRating rating={review.rating} />
                             <span className="text-sm text-gray-600">
                               {formatDate(review.createdAt)}
                             </span>
                           </div>
                          
                          {user && user.userId === review.userId && (
                            <button
                              onClick={() => handleEditReview(review)}
                              className="text-sm text-blue-600 hover:text-blue-700"
                            >
                              Edit
                            </button>
                          )}
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {toast && (
        <Toast message={toast.message} type={toast.type} />
      )}
    </div>
  );
};

export default ReviewSection; 