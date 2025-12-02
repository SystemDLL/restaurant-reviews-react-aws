import React, { useState } from 'react';
import StarRating from './StarRating';
import { API_CONFIG, buildApiUrl, authenticatedFetch } from '../config/api';

const MyRestaurantCard = ({ restaurant, onNavigate, onDelete, onEdit }) => {
  const { name, description, image, rating, id, cuisine, location } = restaurant;
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = (e) => {
    e.preventDefault();
    if (onEdit) {
      onEdit(restaurant);
    }
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const request = {
          action: 'delete_restaurant',
          data:{
            Type: 'get',
            Id: id
          }
        };

      const response = await authenticatedFetch(buildApiUrl(API_CONFIG.ENDPOINTS.PROCESS),
          {
            method: 'POST',
            body: JSON.stringify(request)
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to delete restaurant: ${response.status} ${response.statusText}`);
        }
    const data = await response.json();
      setShowDeleteConfirm(false);
      if (onDelete) {
        onDelete(id);
      }
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      alert('Failed to delete restaurant. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  const handleDetailsClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('restaurant-detail', id);
    }
  };

  return (
    <div className="bg-base-100 shadow-xl rounded-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500">
      <img src={`${API_CONFIG.IMAGE_BASE_URL}${image}`} alt={name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h2 className="mb-2 text-lg font-semibold text-gray-800">
          {name}
        </h2>
        <p className="text-sm text-gray-600 mb-2">
          {description}
        </p>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {cuisine}
          </span>
          <span className="text-xs text-gray-500">
            {location}
          </span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <StarRating rating={rating} />
          <span className="text-sm text-gray-600">
            {rating}/5 ({rating} reviews)
          </span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDetailsClick}
            className="flex-1 py-2 px-3 bg-blue-500 rounded-md text-xs text-white uppercase hover:bg-blue-600 transition-colors"
          >
            View
          </button>
          <button
            onClick={handleEdit}
            className="flex-1 py-2 px-3 bg-green-500 rounded-md text-xs text-white uppercase hover:bg-green-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            className="flex-1 py-2 px-3 bg-red-500 rounded-md text-xs text-white uppercase hover:bg-red-600 transition-colors"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{name}"?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRestaurantCard;