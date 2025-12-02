import React from 'react';

const StarRating = ({ rating, className = "" }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <div className={`select-none ${className}`}>
      {/* Full stars */}
      {[...Array(fullStars)].map((_, index) => (
        <span
          key={`full-${index}`}
          className="material-symbols-outlined text-yellow-500"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star_rate
        </span>
      ))}
      
      {/* Half star */}
      {hasHalfStar && (
        <span
          className="material-symbols-outlined text-yellow-500"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          star_rate_half
        </span>
      )}
      
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, index) => (
        <span
          key={`empty-${index}`}
          className="material-symbols-outlined text-yellow-500"
        >
          star_rate
        </span>
      ))}
    </div>
  );
};

export default StarRating;