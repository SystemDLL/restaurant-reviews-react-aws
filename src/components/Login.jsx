import React from 'react';
import Navigation from './Navigation';
import LoginForm from './LoginForm';
import Footer from './Footer';

const Login = ({ onNavigate }) => {
  return (
    <div>
      <Navigation onNavigate={onNavigate} />
      <LoginForm onNavigate={onNavigate} />
      <Footer />
    </div>
  );
};

export default Login;