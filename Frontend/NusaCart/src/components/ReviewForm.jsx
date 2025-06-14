import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import useReviewStore from '../stores/reviewStore';
import useAuthStore from '../stores/authStore';

const ReviewForm = ({ 
  productId, 
  initialReview = null, 
  onSuccess = null, 
  onCancel = null,
  className = ''
}) => {
  const [reviewForm, setReviewForm] = useState({
    rating: initialReview?.rating || 5,
    comment: initialReview?.comment || ''
  });

  const { createReview, updateReview, submitting, error, clearError } = useReviewStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (initialReview) {
      setReviewForm({
        rating: initialReview.rating,
        comment: initialReview.comment
      });
    }
  }, [initialReview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    if (!reviewForm.comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      if (initialReview) {
        // Update existing review
        await updateReview(initialReview.reviewId, {
          productId: productId,
          userId: user.userId,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim()
        });
      } else {
        // Create new review
        await createReview({
          productId: productId,
          userId: user.userId,
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim()
        });
      }

      // Reset form
      setReviewForm({ rating: 5, comment: '' });
      
      // Call success callback to trigger parent component refresh
      if (onSuccess) {
        onSuccess({
          action: initialReview ? 'updated' : 'created',
          review: {
            productId,
            rating: reviewForm.rating,
            comment: reviewForm.comment.trim()
          }
        });
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const handleCancel = () => {
    setReviewForm({ rating: 5, comment: '' });
    clearError();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {initialReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <StarRating
            rating={reviewForm.rating}
            interactive={true}
            onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
            size="lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Click to rate from 1 to 5 stars
          </p>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Review *
          </label>
          <textarea
            value={reviewForm.comment}
            onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
            placeholder="Share your experience with this product. What did you like or dislike?"
            required
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {reviewForm.comment.length}/1000 characters
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            disabled={submitting || !reviewForm.comment.trim()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {submitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              initialReview ? 'Update Review' : 'Submit Review'
            )}
          </button>
          
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 