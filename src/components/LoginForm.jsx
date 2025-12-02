import React, { useState } from 'react';
import { buildApiUrl, API_CONFIG } from '../config/api.js';

const LoginForm = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // Call the actual LOGIN API endpoint
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.LOGIN), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Check if the response contains a token
        if (data.token) {
          // Set the JWT token and role in a cookie
          document.cookie = `authToken=${data.token}; path=/; max-age=3600; secure; samesite=strict`;
          document.cookie = `role=${data.role}; path=/; max-age=3600; secure; samesite=strict`;
          document.cookie = `name=${data.name}; path=/; max-age=3600; secure; samesite=strict`;
          window.dispatchEvent(new Event('authStatusChanged'));
          setFormData({ email: '', password: '' });
          if (onNavigate) {
            onNavigate('home');
          }
        } else {
          throw new Error('No token received from server');
        }
        
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ general: 'Login failed. Please check your credentials and try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRegisterClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('register');
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 mb-48">
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Sign in
      </h2>

      <div className="mt-6 max-w-md mx-auto w-full shadow-2xl p-6 rounded-lg">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{errors.general}</div>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-gray-800 text-sm font-semibold">
              Email
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                maxLength={50}                
                value={formData.email}
                onChange={handleInputChange}
                className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.email ? 'ring-red-500' : 'ring-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-gray-800 text-sm font-semibold">
                Password
              </label>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={50}                
                value={formData.password}
                onChange={handleInputChange}
                className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.password ? 'ring-red-500' : 'ring-gray-300'
                }`}                
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
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
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <a
            href="/register"
            onClick={handleRegisterClick}
            className="font-semibold leading-6 text-blue-600 hover:text-blue-500"
          >
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;