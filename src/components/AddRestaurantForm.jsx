import React, { useState } from 'react';
import { API_CONFIG, buildApiUrl, authenticatedFetch, readImageAsDataUrl } from '../config/api.js';

const AddRestaurantForm = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cuisine: '',
    location: '',
    image: null
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

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
    
    if (!formData.cuisine) {
      newErrors.cuisine = 'Cuisine type is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    if (!formData.image) {
      newErrors.image = 'Image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {

        const fd = {
          "action":"add_restaurant", 
          "data": {        
            "Type": "restaurant",
            "Id": 0,
            "Title": formData.name,
            "Description": formData.description,
            "Cuisine": formData.cuisine,
            "Location": formData.location,
            "ImageFile": ''
          }
        };
        fd.data.ImageFile = await readImageAsDataUrl(formData.image);

        console.log(fd);
        // Make API call to PROCESS endpoint
        const response = await authenticatedFetch(buildApiUrl(API_CONFIG.ENDPOINTS.PROCESS), {
          method: 'POST',
          body: JSON.stringify(fd),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData || 'Failed to create restaurant');
        }

        const result = await response.json();
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          cuisine: '',
          location: '',
          image: null
        });
        
        // Reset file input
        const fileInput = document.getElementById('image');
        if (fileInput) {
          fileInput.value = '';
        }
        
        // Navigate to My Restaurants page after successful creation
        if (onNavigate) {
          onNavigate('my-restaurants');
        }
        
      } catch (error) {
        console.error('Error creating restaurant:', error);
        setErrors({ general: error.message || 'Failed to create restaurant. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="mt-10 max-w-2xl mx-auto w-full shadow-2xl p-6 rounded-lg mb-48">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Restaurant</h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {errors.general && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{errors.general}</div>
          </div>
        )}
        
        <div>
          <label htmlFor="name" className="block text-gray-800 text-sm font-semibold">
            Restaurant name
          </label>
          <div className="mt-2">
            <input
              id="name"
              name="name"
              type="text"
              maxLength={100}
              value={formData.name}
              onChange={handleInputChange}
              className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.name ? 'ring-red-500' : 'ring-gray-300'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
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
              id="location"
              name="location"
              type="text"
              maxLength={100}
              value={formData.location}
              onChange={handleInputChange}
              className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.location ? 'ring-red-500' : 'ring-gray-300'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
              placeholder="Enter restaurant location"
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
              className={`resize-none h-64 block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                errors.description ? 'ring-red-500' : 'ring-gray-300'
              } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
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
          <div className="mt-2">
            <input 
              id="image" 
              name="image" 
              type="file" 
              accept="image/png, image/jpeg, image/jpg"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formData.image && (
              <p className="mt-1 text-sm text-gray-600">Selected: {formData.image.name}</p>
            )}
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white transition-colors ${
              isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating restaurant...
              </div>
            ) : (
              'Create restaurant'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRestaurantForm;