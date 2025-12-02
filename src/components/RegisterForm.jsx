import React, { useState } from 'react';
import { API_CONFIG, buildApiUrl } from '../config/api.js';

const RegisterForm = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: ''
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
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsLoading(true);
      
      try {
        // Prepare registration data
        const registrationData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password
        };

        // Make actual API call to register endpoint
        const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.REGISTER), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData || 'Registration failed');
        }

        const result = await response.json();
        
        // Show success message
        alert(`Account created successfully for ${formData.email}! Please sign in.`);
        
        // Clear form
        setFormData({ name: '', email: '', role: '', password: '', confirmPassword: '' });
        
        // Navigate to login page after successful registration
        if (onNavigate) {
          onNavigate('login');
        }
        
      } catch (error) {
        console.error('Registration error:', error);
        setErrors({ general: error.message || 'Registration failed. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleLoginClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('login');
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '', colorClass: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colorClasses = [
      { text: 'text-red-600', bg: 'bg-red-500' },
      { text: 'text-orange-600', bg: 'bg-orange-500' },
      { text: 'text-yellow-600', bg: 'bg-yellow-500' },
      { text: 'text-green-600', bg: 'bg-green-500' },
      { text: 'text-emerald-600', bg: 'bg-emerald-500' }
    ];
    
    return {
      strength: (strength / 5) * 100,
      label: labels[strength - 1] || '',
      colorClass: colorClasses[strength - 1] || { text: 'text-gray-600', bg: 'bg-gray-500' }
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 mb-48">
      <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
        Create your account
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
              Email address
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
                } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                placeholder="Enter your email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-800 text-sm font-semibold">
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                maxLength={50}
                value={formData.password}
                onChange={handleInputChange}
                className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.password ? 'ring-red-500' : 'ring-gray-300'
                } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                placeholder="Create a strong password"
              />
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Password strength:</span>
                    <span className={`${passwordStrength.colorClass.text} font-medium`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${passwordStrength.colorClass.bg} transition-all duration-300`}
                      style={{ width: `${passwordStrength.strength}%` }}
                    />
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              
              <div className="mt-2 text-sm text-gray-500">
                Password must contain at least 8 characters with uppercase, lowercase, and numbers.
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-gray-800 text-sm font-semibold">
              Confirm Password
            </label>
            <div className="mt-2">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                maxLength={50}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.confirmPassword ? 'ring-red-500' : 'ring-gray-300'
                } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
              
              {/* Password match indicator */}
              {formData.confirmPassword && formData.password && (
                <div className="mt-1 flex items-center">
                  {formData.password === formData.confirmPassword ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Passwords match
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 text-sm">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Passwords don't match
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-gray-800 text-sm font-semibold">
              Name
            </label>
            <div className="mt-2">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                maxLength={50}
                value={formData.name}
                onChange={handleInputChange}
                className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.name ? 'ring-red-500' : 'ring-gray-300'
                } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="role" className="block text-gray-800 text-sm font-semibold">
              I'm a
            </label>
            <div className="mt-2">
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className={`block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                  errors.role ? 'ring-red-500' : 'ring-gray-300'
                } focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
              >
                <option value="">Select your role</option>
                <option value="Reviewer">Reviewer</option>
                <option value="Restaurant">Restaurant Owner</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
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
                  Creating account...
                </div>
              ) : (
                'Create account'
              )}
            </button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?{' '}
          <a
            href="/login"
            onClick={handleLoginClick}
            className="font-semibold leading-6 text-blue-600 hover:text-blue-500"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;