
import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ratingLabels = ["Poor", "Fair", "Good", "Very Good", "Excellent"];

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md',
  className = '',
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const isInteractive = !readonly && onRatingChange;

  const handleRatingClick = (index: number) => {
    if (isInteractive) {
      onRatingChange(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (isInteractive) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;
  const currentLabel = displayRating > 0 ? ratingLabels[displayRating - 1] : '';

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className="flex"
        onMouseLeave={handleMouseLeave}
        role={isInteractive ? "radiogroup" : "img"}
        aria-label={isInteractive ? "Star rating" : `Rating: ${rating} out of 5 stars`}
      >
        {[...Array(5)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= displayRating;

          return (
            <button
              key={i}
              type="button"
              disabled={!isInteractive}
              onClick={() => handleRatingClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              className={`transition-colors duration-200 ${
                isInteractive ? 'cursor-pointer' : 'cursor-default'
              }`}
              aria-label={isInteractive ? `${starValue} star` : undefined}
              aria-checked={isInteractive ? rating === starValue : undefined}
              role={isInteractive ? "radio" : undefined}
            >
              <Star
                className={`
                  ${sizeClasses[size]}
                  ${isFilled ? 'text-yellow-400' : 'text-gray-300'}
                  transition-transform duration-200
                  ${isInteractive && isFilled ? 'hover:scale-110' : ''}
                `}
                fill={isFilled ? 'currentColor' : 'none'}
              />
            </button>
          );
        })}
      </div>
      {isInteractive && (
        <div className="h-5 text-sm font-medium text-gray-600">
          {currentLabel}
        </div>
      )}
    </div>
  );
};

export default StarRating;
