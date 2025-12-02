import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import MyRestaurantCard from './MyRestaurantCard';
import { authenticatedFetch, buildApiUrl, API_CONFIG } from '../config/api';

const MyRestaurants = ({ onNavigate }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMyRestaurants();
  }, []);

  const loadMyRestaurants = async () => {
    setLoading(true);
    setError(null);
    
    try {

      const request = {
          action: 'my_restaurants',
          data:{
            Type: 'get',
            Id: 0
          }
        };

      const response = await authenticatedFetch(buildApiUrl(API_CONFIG.ENDPOINTS.PROCESS),
          {
            method: 'POST',
            body: JSON.stringify(request)
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to submit review: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();

      setRestaurants(data);
    } catch (error) {
      console.error('Error loading my restaurants:', error);
      setError('Failed to load your restaurants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = (restaurantId) => {
    setRestaurants(prev => prev.filter(restaurant => restaurant.id !== restaurantId));
  };

  const handleEditRestaurant = (restaurant) => {
    if (onNavigate) {
      onNavigate('edit-restaurant', restaurant.id, restaurant);
    }
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('add-restaurant');
    }
  };

  return (
    <div>
      <Navigation onNavigate={onNavigate} />
      
      <div className="mx-auto max-w-6xl w-full py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Restaurants</h1>
          <button
            onClick={handleAddNew}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Add New Restaurant
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading your restaurants...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="py-10">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>
                <div className="ml-3">
                  <button
                    onClick={loadMyRestaurants}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restaurants Grid */}
        {!loading && restaurants.length > 0 && (
          <div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                You have {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map((restaurant) => (
                <MyRestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  onNavigate={onNavigate}
                  onDelete={handleDeleteRestaurant}
                  onEdit={handleEditRestaurant}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && restaurants.length === 0 && !error && (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No restaurants yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding your first restaurant.</p>
              <button
                onClick={handleAddNew}
                className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Add Restaurant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRestaurants;