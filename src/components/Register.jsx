import React from 'react';
import Navigation from './Navigation';
import RegisterForm from './RegisterForm';
import Footer from './Footer';

const Register = ({ onNavigate }) => {
  return (
    <div>
      <Navigation onNavigate={onNavigate} />
      <RegisterForm onNavigate={onNavigate} />
      <Footer />
    </div>
  );
};

export default Register;