import React, { useState, useEffect } from 'react';
import { authenticatedFetch, buildApiUrl, API_CONFIG, readImageAsDataUrl } from '../config/api.js';
import Navigation from './Navigation';

const EditRestaurantForm = ({ restaurant, onNavigate, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    location: '',
    image: null
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  // Initialize form data with restaurant data
  useEffect(() => {
    if (restaurant) {
      setFormData({
        name: restaurant.name || '',
        description: restaurant.description || '',
        cuisine: restaurant.cuisine || '',
        location: restaurant.location || '',
        image: null // Always start with null for file input
      });
      setCurrentImageUrl(restaurant.image || '');
    }
  }, [restaurant]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));

    // Clear error when user selects a file
    if (errors.image) {
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Restaurant name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.cuisine.trim()) {
      newErrors.cuisine = 'Cuisine type is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {

        const fd = {
          "action":"update_restaurant", 
          "data": {        
            "Type": "restaurant",
            "Id": restaurant.id,
            "Title": formData.name,
            "Description": formData.description,
            "Cuisine": formData.cuisine,
            "Location": formData.location,
            "ImageFile": ''
          }
        };

        if (formData.image) {
            fd.data.ImageFile = await readImageAsDataUrl(formData.image);
        }
        
        console.log(fd);

        // Make API call to PROCESS endpoint
        const response = await authenticatedFetch(buildApiUrl(API_CONFIG.ENDPOINTS.PROCESS), {
          method: 'POST',
          body: JSON.stringify(fd),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData || 'Failed to update restaurant');
        }

        const result = await response.json();
        console.log('Restaurant updated successfully:', result);
      
        if (onSuccess) {
            onSuccess(result);
        }
      
      // Navigate back to My Restaurants
      if (onNavigate) {
        onNavigate('my-restaurants');
      }
    } catch (error) {
      console.error('Error updating restaurant:', error);
      setErrors({ submit: 'Failed to update restaurant. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('my-restaurants');
    }
  };

  if (!restaurant) {
    return (
      <div>
        <Navigation onNavigate={onNavigate} />
        <div className="mx-auto max-w-2xl w-full py-10">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">Restaurant not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation onNavigate={onNavigate} />
      <div className="mt-10 max-w-2xl mx-auto w-full shadow-2xl p-6 rounded-lg mb-48">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Restaurant</h1>
          
          {errors.submit && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-gray-800 text-sm font-semibold">
                Restaurant name
              </label>
              <div className="mt-2">
              <input
                type="text"
                id="name"
                name="name"
                maxLength={100}
                value={formData.name}
                onChange={handleInputChange}
                className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.name ? 'ring-red-500' : 'ring-gray-300'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                placeholder="Enter restaurant name"
                disabled={isLoading}
              />              
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
              </div>
            </div>

          <div>
            <label htmlFor="cuisine" className="block text-gray-800 text-sm font-semibold">
              Cuisine Type
            </label>
            <div className="mt-2">
              <select
                id="cuisine"
                name="cuisine"
                value={formData.cuisine}
                onChange={handleInputChange}
                className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.cuisine ? 'ring-red-500' : 'ring-gray-300'
              } focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                disabled={isLoading}
              >
                <option value="">Select cuisine type</option>
                <option value="Italian">Italian</option>
                <option value="French">French</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
                <option value="Indian">Indian</option>
                <option value="Mexican">Mexican</option>
                <option value="Greek">Greek</option>
              </select>
              {errors.cuisine && (
                <p className="mt-1 text-sm text-red-600">{errors.cuisine}</p>
              )}
              </div>
            </div>
            
            <div>
          <label htmlFor="location" className="block text-gray-800 text-sm font-semibold">
            Location
          </label>
            <div className="mt-2">
              <input
                type="text"
                id="location"
                name="location"
                maxLength={100}
                value={formData.location}
                onChange={handleInputChange}
                className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.location ? 'ring-red-500' : 'ring-gray-300'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                placeholder="Enter restaurant location"
                disabled={isLoading}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600">{errors.location}</p>
              )}
            </div>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <label htmlFor="description" className="block text-gray-800 text-sm font-semibold">
                    Description
                    </label>
                </div>
                <div className="mt-2">
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={`resize-none h-64 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.description ? 'ring-red-500' : 'ring-gray-300'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                placeholder="Describe your restaurant"
                disabled={isLoading}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            </div>

            <div>
            <div className="flex items-center justify-between">
                <label htmlFor="image" className="block text-gray-800 text-sm font-semibold">
                Image
                </label>
            </div>
              {currentImageUrl && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">Current image:</p>
                  <img 
                    src={`${API_CONFIG.IMAGE_BASE_URL}${currentImageUrl}`} 
                    alt="Current restaurant" 
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                </div>
              )}
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave empty to keep current image.
              </p>
              {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors font-medium"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                {isLoading ? 'Updating...' : 'Update Restaurant'}
              </button>
            </div>
          </form>        
      </div>
    </div>
  );
};

export default EditRestaurantForm;