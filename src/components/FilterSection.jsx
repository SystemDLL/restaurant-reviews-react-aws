import React, { useState, useEffect } from 'react';

// Helper function to clear filter cookie
const clearFilterCookie = () => {
  document.cookie = 'filters=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

// Helper function to clear sort cookie
const clearSortCookie = () => {
  document.cookie = 'sortBy=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

const FilterSection = ({ filters, onFilterChange, sortBy, onSortChange }) => {
  const [localFilters, setLocalFilters] = useState({
    cuisine: '',
    minRating: '',
    maxRating: ''
  });

  const [localSortBy, setLocalSortBy] = useState('rating-desc');

  // Sync local filters with props
  useEffect(() => {
    if (filters) {
      setLocalFilters(filters);
    }
  }, [filters]);

  // Sync local sortBy with props
  useEffect(() => {
    if (sortBy) {
      setLocalSortBy(sortBy);
    }
  }, [sortBy]);

  const handleFilterChange = (filterType, value) => {
    let newFilters;
    
    if (filterType === 'all') {
      // Clear all filters
      newFilters = {
        cuisine: '',
        minRating: '',
        maxRating: ''
      };
    } else {
      newFilters = {
        ...localFilters,
        [filterType]: value
      };
    }
    
    setLocalFilters(newFilters);
    
    // Notify parent component about filter changes
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const handleSortChange = (newSortBy) => {
    setLocalSortBy(newSortBy);
    
    // Notify parent component about sort changes
    if (onSortChange) {
      onSortChange(newSortBy);
    }
  };

  return (
    <div className="mx-auto max-w-6xl w-full">
      <div className="flex justify-center items-center my-10">
        <div className="mr-6">
          <label className="text-sm text-gray-500">Cuisine </label>
          <select 
            className="border-gray-300 border rounded-md p-1"
            value={localFilters.cuisine}
            onChange={(e) => handleFilterChange('cuisine', e.target.value)}
          >
            <option value="">Any</option>
            <option value="italian">Italian</option>
            <option value="french">French</option>
            <option value="chinese">Chinese</option>
            <option value="japanese">Japanese</option>
            <option value="indian">Indian</option>
            <option value="mexican">Mexican</option>
            <option value="greek">Greek</option>
          </select>
        </div>

        <div className="mr-6">
          <label className="text-sm text-gray-500">Minimum rating </label>
          <select 
            className="border-gray-300 border rounded-md p-1"
            value={localFilters.minRating}
            onChange={(e) => handleFilterChange('minRating', e.target.value)}
          >
            <option value="">Any</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>
        </div>

        <div className="mr-6">
          <label className="text-sm text-gray-500">Maximum rating </label>
          <select 
            className="border-gray-300 border rounded-md p-1"
            value={localFilters.maxRating}
            onChange={(e) => handleFilterChange('maxRating', e.target.value)}
          >
            <option value="">Any</option>
            <option value="5">5</option>
            <option value="4">4</option>
            <option value="3">3</option>
            <option value="2">2</option>
            <option value="1">1</option>
          </select>
        </div>

        <div className="mr-6">
          <label className="text-sm text-gray-500">Sort by </label>
          <select 
            className="border-gray-300 border rounded-md p-1"
            value={localSortBy}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="rating-desc">Rating (High to Low)</option>
            <option value="rating-asc">Rating (Low to High)</option>
          </select>
        </div>

        <div>
          <button
            onClick={() => handleFilterChange('all', '')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-md text-sm transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;