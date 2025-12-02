import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import FilterSection from './components/FilterSection';
import RestaurantCard from './components/RestaurantCard';
import Footer from './components/Footer';
import AddRestaurant from './components/AddRestaurant';
import Login from './components/Login';
import Register from './components/Register';
import RestaurantDetail from './components/RestaurantDetail';
import MyRestaurants from './components/MyRestaurants';
import EditRestaurantForm from './components/EditRestaurantForm';
import { buildApiUrl } from './config/api';

// Helper functions for filter cookies
const getFilterCookie = () => {
  const cookies = document.cookie.split(';');
  const filterCookie = cookies.find(cookie => cookie.trim().startsWith('filters='));
  if (filterCookie) {
    try {
      const filterValue = filterCookie.split('=')[1];
      return JSON.parse(decodeURIComponent(filterValue));
    } catch (error) {
      console.error('Error parsing filter cookie:', error);
      return null;
    }
  }
  return null;
};

const setFilterCookie = (filters) => {
  try {
    const filterValue = encodeURIComponent(JSON.stringify(filters));
    // Set cookie to expire in 30 days
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    document.cookie = `filters=${filterValue}; path=/; expires=${expirationDate.toUTCString()}`;
  } catch (error) {
    console.error('Error setting filter cookie:', error);
  }
};

const clearFilterCookie = () => {
  document.cookie = 'filters=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

// Helper functions for sorting cookies
const getSortCookie = () => {
  const cookies = document.cookie.split(';');
  const sortCookie = cookies.find(cookie => cookie.trim().startsWith('sortBy='));
  if (sortCookie) {
    try {
      return sortCookie.split('=')[1];
    } catch (error) {
      console.error('Error parsing sort cookie:', error);
      return null;
    }
  }
  return null;
};

const setSortCookie = (sortBy) => {
  try {
    // Set cookie to expire in 30 days
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    document.cookie = `sortBy=${sortBy}; path=/; expires=${expirationDate.toUTCString()}`;
  } catch (error) {
    console.error('Error setting sort cookie:', error);
  }
};

const clearSortCookie = () => {
  document.cookie = 'sortBy=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize filters from cookie or use defaults
  const [filters, setFilters] = useState(() => {
    const savedFilters = getFilterCookie();
    if (savedFilters) {
      console.log('Loaded filters from cookie:', savedFilters);
    }
    return savedFilters || {
      cuisine: '',
      minRating: '',
      maxRating: ''
    };
  });

  // Initialize sorting from cookie or use default
  const [sortBy, setSortBy] = useState(() => {
    const savedSortBy = getSortCookie();
    if (savedSortBy) {
      console.log('Loaded sort preference from cookie:', savedSortBy);
    }
    return savedSortBy || 'rating-desc';
  });

  // Fetch restaurants from API
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(buildApiUrl());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API data to match our component structure if needed
      const transformedData = Array.isArray(data) ? data : data.restaurants || [];
      
      // Ensure each restaurant has required fields
      const restaurantsWithDefaults = transformedData.map((restaurant, index) => ({
        id: restaurant.id || index + 1,
        name: restaurant.name || 'Unknown Restaurant',
        description: restaurant.description || 'No description available',
        image: restaurant.image || '/assets/restaurant1.jpg',
        rating: restaurant.rating || 0,
        ...restaurant // Spread any additional fields from API
      }));
      
      setRestaurants(restaurantsWithDefaults);
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      //setError(err.message);    
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    // Save filters to cookie
    setFilterCookie(newFilters);
  };

  // Handle sort changes
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    // Save sort preference to cookie
    setSortCookie(newSortBy);
  };

  // Filter and sort restaurants based on current filters and sort option
  const filteredAndSortedRestaurants = restaurants.filter(restaurant => {
    // Cuisine filter
    if (filters.cuisine && restaurant.cuisine && 
        restaurant.cuisine.toLowerCase() !== filters.cuisine.toLowerCase()) {
      return false;
    }

    // Minimum rating filter
    if (filters.minRating && restaurant.rating < parseFloat(filters.minRating)) {
      return false;
    }

    // Maximum rating filter
    if (filters.maxRating && restaurant.rating > parseFloat(filters.maxRating)) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Sort by rating
    if (sortBy === 'rating-desc') {
      return (b.rating || 0) - (a.rating || 0); // High to low
    } else if (sortBy === 'rating-asc') {
      return (a.rating || 0) - (b.rating || 0); // Low to high
    }
    return 0; // No sorting
  });

  // Enhanced navigation function to handle restaurant details and editing
  const handleNavigation = (page, restaurantId = null, restaurantData = null, shouldRefresh = false) => {
    setCurrentPage(page);
    setSelectedRestaurantId(restaurantId);
    setEditingRestaurant(restaurantData);
    
    // Refresh restaurants data when navigating back to home page or when explicitly requested
    if (page === 'home' || shouldRefresh) {
      fetchRestaurants();
    }
  };

  // Function to refresh data without navigation
  const refreshData = () => {
    fetchRestaurants();
  };

  // Simple routing function
  const renderPage = () => {
    switch (currentPage) {
      case 'add-restaurant':
        return <AddRestaurant onNavigate={handleNavigation} onRefresh={refreshData} />;
      case 'my-restaurants':
        return <MyRestaurants onNavigate={handleNavigation} />;
      case 'edit-restaurant':
        return (
          <EditRestaurantForm 
            restaurant={editingRestaurant} 
            onNavigate={handleNavigation} 
            onSuccess={refreshData} 
          />
        );
      case 'login':
        return <Login onNavigate={handleNavigation} />;
      case 'register':
        return <Register onNavigate={handleNavigation} />;
      case 'restaurant-detail':
        return <RestaurantDetail onNavigate={handleNavigation} restaurantId={selectedRestaurantId} onRefresh={refreshData} />;
      case 'home':
      default:
        return (
          <div>
            <Navigation onNavigate={handleNavigation} />
            <FilterSection 
              filters={filters} 
              onFilterChange={handleFilterChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
            />
            
            {/* Results Count */}
            {!loading && restaurants.length > 0 && (
              <div className="mx-auto max-w-6xl w-full mb-4">
                <div className="text-sm text-gray-600">
                  Showing {filteredAndSortedRestaurants.length} of {restaurants.length} restaurants
                  {(filters.cuisine || filters.minRating || filters.maxRating) && (
                    <span className="ml-2 text-blue-600">
                      (filtered)
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Loading State */}
            {loading && (
              <div className="mx-auto max-w-6xl w-full flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Loading restaurants...</p>
                </div>
              </div>
            )}
            
            {/* Error State */}
            {error && !loading && (
              <div className="mx-auto max-w-6xl w-full py-10">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-sm font-medium text-red-800">Error loading restaurants</h3>
                    </div>
                    <div className="ml-3">
                      <button
                        onClick={fetchRestaurants}
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
            {!loading && filteredAndSortedRestaurants.length > 0 && (
              <div className="mx-auto max-w-6xl w-full grid grid-cols-3 gap-8">
                {filteredAndSortedRestaurants.map((restaurant) => (
                  <RestaurantCard 
                    key={restaurant.id} 
                    restaurant={restaurant} 
                    onNavigate={handleNavigation}
                  />
                ))}
              </div>
            )}
            
            {/* Empty State */}
            {!loading && filteredAndSortedRestaurants.length === 0 && restaurants.length > 0 && !error && (
              <div className="mx-auto max-w-6xl w-full flex justify-center items-center py-20">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No restaurants match your filters</h3>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
                  <button
                    onClick={() => {
                      const clearedFilters = { cuisine: '', minRating: '', maxRating: '' };
                      setFilters(clearedFilters);
                      setFilterCookie(clearedFilters);
                    }}
                    className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            )}
            
            {/* Empty State - No restaurants at all */}
            {!loading && restaurants.length === 0 && !error && (
              <div className="mx-auto max-w-6xl w-full flex justify-center items-center py-20">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No restaurants found</h3>
                  <p className="mt-1 text-sm text-gray-500">No restaurants are available at the moment.</p>
                </div>
              </div>
            )}            
            <Footer />
          </div>
        );
    }
  };

  return (
      renderPage()
  );
}

export default App;