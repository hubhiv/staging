import React from 'react';
import { Star } from 'lucide-react';
interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  color?: string;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
}
export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 20,
  color = 'gold',
  onChange,
  readOnly = false
}) => {
  const handleStarClick = (selectedRating: number) => {
    if (!readOnly && onChange) {
      // If clicking the same star that's already selected, clear the rating
      if (selectedRating === rating) {
        onChange(0);
      } else {
        onChange(selectedRating);
      }
    }
  };
  return <div className="flex items-center">
      {[...Array(maxRating)].map((_, index) => {
      const starValue = index + 1;
      const isFilled = starValue <= rating;
      return <button key={index} type="button" className={`p-0.5 focus:outline-none ${!readOnly ? 'cursor-pointer' : 'cursor-default'}`} onClick={() => handleStarClick(starValue)} disabled={readOnly} aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}>
            <Star size={size} className={`${isFilled ? 'fill-current' : 'stroke-current'} ${isFilled ? `text-${color}` : 'text-gray-300'}`} color={isFilled ? color : undefined} fill={isFilled ? color : 'none'} />
          </button>;
    })}
    </div>;
};