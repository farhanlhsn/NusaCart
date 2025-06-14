import { useState } from 'react';

const StarRating = ({ 
  rating = 0, 
  maxStars = 5, 
  size = 'md', 
  interactive = false, 
  onRatingChange = null,
  showNumber = false,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  const currentRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const handleClick = (starValue) => {
    if (interactive && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const handleMouseEnter = (starValue) => {
    if (interactive) {
      setHoverRating(starValue);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <div className="flex">
        {[...Array(maxStars)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= currentRating;
          
          return (
            <button
              key={index}
              type={interactive ? 'button' : undefined}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              className={`
                ${sizeClasses[size]} 
                ${isFilled ? 'text-yellow-400' : 'text-gray-300'} 
                ${interactive ? 'hover:text-yellow-400 cursor-pointer transition-colors' : ''}
                ${interactive ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 rounded' : ''}
              `}
              disabled={!interactive}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            >
              ★
            </button>
          );
        })}
      </div>
      
      {showNumber && (
        <span className={`text-gray-600 ${sizeClasses[size]} ml-2`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating; 