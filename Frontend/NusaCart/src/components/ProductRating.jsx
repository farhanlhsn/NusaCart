import { useEffect } from 'react';
import StarRating from './StarRating';
import useReviewStore from '../stores/reviewStore';

const ProductRating = ({ 
  productId, 
  showReviewCount = true,
  size = 'sm',
  className = ''
}) => {
  const { 
    fetchReviewsByProduct, 
    getReviewsByProduct, 
    getAverageRating,
    isProductReviewsLoaded 
  } = useReviewStore();

  const reviews = getReviewsByProduct(productId) || [];
  const averageRating = getAverageRating(productId) || 0;

  useEffect(() => {
    // Only fetch if productId exists and reviews not already loaded
    if (productId && !isProductReviewsLoaded(productId)) {
      // Add small delay to batch multiple requests
      const timer = setTimeout(() => {
        fetchReviewsByProduct(productId);
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [productId, fetchReviewsByProduct, isProductReviewsLoaded]);

  // This component will re-render automatically when reviews change
  // because we're directly using getReviewsByProduct which accesses the store

  if (reviews.length === 0) {
    return (
      <div className={`flex items-center text-gray-400 ${className}`}>
        <StarRating rating={0} size={size} />
        {showReviewCount && (
          <span className="text-xs ml-1">No reviews</span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <StarRating rating={averageRating} size={size} />
      <span className="text-sm font-medium text-gray-700 ml-1">
        {averageRating.toFixed(1)}
      </span>
      {showReviewCount && (
        <span className="text-xs text-gray-500 ml-1">
          ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
        </span>
      )}
    </div>
  );
};

export default ProductRating; 