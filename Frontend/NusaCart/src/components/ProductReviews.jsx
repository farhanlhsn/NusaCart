import { useState, useEffect } from 'react';
import useReviewStore from '../stores/reviewStore';
import useAuthStore from '../stores/authStore';
import useOrderStore from '../stores/orderStore';

const ProductReviews = ({ productId, reviews, averageRating }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });

  const { 
    createReview, 
    submitting, 
    error,
    getRatingDistribution 
  } = useReviewStore();
  
  const { user } = useAuthStore();
  const { orders } = useOrderStore();

  const [canReview, setCanReview] = useState(false);

  useEffect(() => {
    // Check if user has purchased this product
    if (user && orders.length > 0) {
      const hasPurchased = orders.some(order =>
        order.items.some(item => item.productId === productId) &&
        order.orderStatus === 'DELIVERED'
      );
      setCanReview(hasPurchased);
    }
  }, [user, orders, productId]);

  const ratingDistribution = getRatingDistribution(productId);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    try {
      await createReview({
        productId: productId,
        userId: user.userId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      
      setReviewForm({ rating: 5, comment: '' });
      setShowReviewForm(false);
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const renderStars = (rating, interactive = false, onRatingChange = null) => {
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type={interactive ? 'button' : undefined}
          onClick={interactive ? () => onRatingChange(i) : undefined}
          className={`${
            i <= rating ? 'text-yellow-400' : 'text-gray-300'
          } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : ''} text-lg`}
          disabled={!interactive}
        >
          ★
        </button>
      );
    }
    
    return stars;
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

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(averageRating))}
            </div>
            <p className="text-gray-600">
              Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
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

      {/* Write Review Section */}
      {user && canReview && (
        <div className="border-t pt-6">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Write a Review
            </button>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Write Your Review</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <div className="flex space-x-1">
                  {renderStars(reviewForm.rating, true, (rating) =>
                    setReviewForm(prev => ({ ...prev, rating }))
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your experience with this product..."
                  required
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewForm({ rating: 5, comment: '' });
                  }}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {!user && (
        <div className="border-t pt-6">
          <p className="text-gray-600">
            <a href="/login" className="text-blue-600 hover:text-blue-700">
              Login
            </a> to write a review
          </p>
        </div>
      )}

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
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-gray-600">
                        {formatDate(review.createdAt)}
                      </span>
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
  );
};

export default ProductReviews; 