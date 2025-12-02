import React from 'react';
import Navigation from './Navigation';
import AddRestaurantForm from './AddRestaurantForm';
import Footer from './Footer';

const AddRestaurant = ({ onNavigate }) => {
  return (
    <div>
      <Navigation onNavigate={onNavigate} />
      <AddRestaurantForm onNavigate={onNavigate} />
      <Footer />
    </div>
  );
};

export default AddRestaurant;