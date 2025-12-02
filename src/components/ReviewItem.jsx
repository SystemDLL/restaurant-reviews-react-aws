import React from 'react';
import StarRating from './StarRating';

const ReviewItem = ({ review }) => {
  const { rating, author, date, content } = review;

  return (
    <div className="p-4 my-3 shadow-sm">
      <div className="flex justify-between items-center">
        <div className="leading-loose">
          <StarRating rating={rating} />
        </div>

        <div className="leading-loose text-sm text-gray-600">
          By <strong>{author}</strong> on {date}
        </div>
      </div>

      <div className="mt-3 text-gray-800 leading-relaxed">
        {content}
      </div>
    </div>
  );
};

export default ReviewItem;