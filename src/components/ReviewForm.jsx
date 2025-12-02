import React, { useState, useEffect } from 'react';
import { getAuthToken, getUserRole, getUserName, buildApiUrl, authenticatedFetch, API_CONFIG } from '../config/api.js';

const ReviewForm = ({ onSubmitReview, restaurantId }) => {
  const [formData, setFormData] = useState({
    comment: '',
    rating: 5
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check authentication and role status
  useEffect(() => {
    const checkAuthAndRole = () => {
      const token = getAuthToken();
      const role = getUserRole();
      
      setIsAuthenticated(!!token);
      setUserRole(role);
      setIsAuthorized(!!token && role === 'Reviewer');
    };

    checkAuthAndRole();
    
    // Listen for auth status changes
    const handleAuthStatusChange = () => {
      checkAuthAndRole();
    };
    
    window.addEventListener('authStatusChanged', handleAuthStatusChange);
    
    return () => {
      window.removeEventListener('authStatusChanged', handleAuthStatusChange);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.comment.trim()) {
      newErrors.comment = 'Please write a review';
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'Review must be at least 10 characters long';
    }

    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Please select a valid rating';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Prepare the review data to send to the API
        const reviewData = {
          action: 'add_review',
          data:{
            Type: 'review',
            Id: 0,
            RestaurantId: restaurantId,
            Rating: formData.rating,
            Comment: formData.comment.trim()
          }
        };

        // Make API call to the PROCESS endpoint
        const response = await authenticatedFetch(
          buildApiUrl(API_CONFIG.ENDPOINTS.PROCESS),
          {
            method: 'POST',
            body: JSON.stringify(reviewData)
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to submit review: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        // Create review object for local state update
        const newReview = {
          id: result.id || Date.now(),
          rating: formData.rating,
          author: getUserName() || 'You',
          date: new Date().toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          }),
          content: formData.comment.trim()
        };

        // Call the callback to add the review
        if (onSubmitReview) {
          onSubmitReview(newReview);
        }

        // Clear form
        setFormData({
          comment: '',
          rating: 5
        });

      } catch (error) {
        console.error('Error submitting review:', error);
        setErrors({ general: `Failed to submit review: ${error.message}` });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="shadow-md px-4 py-6 rounded-lg space-y-3">
      {!isAuthenticated ? (
        // User not authenticated
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sign in to write a review</h3>
          <p className="text-sm text-gray-500">
            You need to be signed in to submit a review for this restaurant.
          </p>
        </div>
      ) : !isAuthorized ? (
        // User authenticated but doesn't have Reviewer role
        <div className="text-center py-8">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-sm text-gray-500">
            Only users with "Reviewer" role can submit reviews.
          </p>
        </div>
      ) : (
        // User authenticated and has Reviewer role
        <form onSubmit={handleSubmit}>
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        )}

        <div>
          <label className="text-gray-800 text-sm font-semibold" htmlFor="comment">
            Have you been here? How did you find it? 
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            className={`w-full rounded-lg border-0 shadow-sm p-2 h-36 resize-none ring-1 ring-inset ${
              errors.comment ? 'ring-red-500' : 'ring-gray-300'
            } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600`}
            placeholder="Write your review..."
          />
          {errors.comment && (
            <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
          )}
          <div className="mt-1 text-sm text-gray-500">
            {formData.comment.length}/500 characters
          </div>
        </div>

        <div>
          <label className="text-gray-800 text-sm font-semibold" htmlFor="rating">
            Rating
          </label>
          <select
            className={`w-20 border rounded-md p-1 ${
              errors.rating ? 'border-red-500' : 'border-gray-300'
            }`}
            id="rating"
            name="rating"
            value={formData.rating}
            onChange={handleInputChange}
          >
            <option value={5}>5 ⭐</option>
            <option value={4}>4 ⭐</option>
            <option value={3}>3 ⭐</option>
            <option value={2}>2 ⭐</option>
            <option value={1}>1 ⭐</option>
          </select>
          {errors.rating && (
            <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`mt-4 flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white transition-colors ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </div>
            ) : (
              'Submit review'
            )}
          </button>
        </div>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;