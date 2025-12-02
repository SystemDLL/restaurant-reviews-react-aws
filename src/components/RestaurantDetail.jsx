import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import Footer from './Footer';
import StarRating from './StarRating';
import ReviewForm from './ReviewForm';
import ReviewItem from './ReviewItem';
import { buildApiUrl, API_CONFIG } from '../config/api.js';

const RestaurantDetail = ({ onNavigate, restaurantId }) => {
  const [restaurantData, setRestaurantData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const response = await fetch(buildApiUrl() + `?id=${restaurantId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch restaurant data: ${response.status}`);
      }
      
      const data = await response.json();
      setRestaurantData(data);
      
      // If the API response includes reviews, use them, otherwise initialize empty array
      if (data && data.length > 0 && data[0].reviews) {
        setReviews(data[0].reviews);
      } else {
        setReviews([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching restaurant data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData();
    }
  }, [restaurantId]);

  const handleSubmitReview = (newReview) => {
    //setReviews(prev => [newReview, ...prev]);
    fetchRestaurantData();
  };

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  // Loading state
  if (loading) {
    return (
      <div>
        <Navigation onNavigate={onNavigate} />
        <div className="mx-auto max-w-6xl mt-16">
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-600">Loading restaurant details...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div>
        <Navigation onNavigate={onNavigate} />
        <div className="mx-auto max-w-6xl mt-16">
          <div className="flex justify-center items-center py-20">
            <div className="text-red-600">Error: {error}</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // No data state
  if (!restaurantData || restaurantData.length === 0) {
    return (
      <div>
        <Navigation onNavigate={onNavigate} />
        <div className="mx-auto max-w-6xl mt-16">
          <div className="flex justify-center items-center py-20">
            <div className="text-gray-600">Restaurant not found</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navigation onNavigate={onNavigate} />
      
      <div className="mx-auto max-w-6xl mt-16">
        {/* Restaurant Header */}
        <div className="flex items-center mb-4">
          <h2 className="font-bold text-3xl text-gray-800">{restaurantData[0].name}</h2>
          <div className="ml-4">
            <StarRating rating={averageRating} />
          </div>
          <div className="ml-2 text-gray-600 text-sm">
            ({averageRating.toFixed(1)} from {reviews.length} reviews)
          </div>
        </div>

        {/* Address */}
        <div className="text-gray-500 text-sm mb-6 font-semibold">
          {restaurantData[0].cuisine} cuisine in {restaurantData[0].location}
        </div>

        {/* Restaurant Info Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-justify text-gray-800 leading-relaxed">
              {restaurantData[0].description}
            </p>
          </div>
          <div>
            <img
              src={`${API_CONFIG.IMAGE_BASE_URL}${restaurantData[0].image}`}
              alt={restaurantData[0].name}
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
        </div>

        {/* Reviews Section */}
        <div className="my-6">
          <h2 className="font-semibold text-2xl text-gray-700 mb-4">
            Reviews ({reviews.length})
          </h2>

          {/* Review Form */}
          <ReviewForm onSubmitReview={handleSubmitReview} restaurantId={restaurantId} />

          {/* Reviews List */}
          <div className="my-6">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No reviews yet. Be the first to review this restaurant!
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RestaurantDetail;