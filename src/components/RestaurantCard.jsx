import React from 'react';
import StarRating from './StarRating';
import { API_CONFIG } from '../config/api';
const RestaurantCard = ({ restaurant, onNavigate }) => {
  const { name, description, image, rating, id } = restaurant;

  const handleDetailsClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('restaurant-detail', id);
    }
  };

  return (
    <div className="bg-base-100 shadow-xl rounded-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
      <img src={`${API_CONFIG.IMAGE_BASE_URL}${image}`} alt={name} className="w-full h-48 object-cover" />
      <div className="p-2">
        <h2 className="px-2 mb-1 mt-1 leading-none text-lg font-semibold text-gray-600">
          {name}
        </h2>
        <p className="px-2 leading-none text-sm text-gray-500">
          {description}
        </p>
        <div className="flex justify-between px-2 mt-5">
          <StarRating rating={rating} />
          <button
            onClick={handleDetailsClick}
            className="py-2 px-4 bg-blue-500 rounded-md text-xs text-white uppercase hover:bg-blue-600 transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;