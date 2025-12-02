import React, { useState, useEffect } from 'react';
import { getAuthToken, getUserRole, getUserName , clearAuthToken } from '../config/api.js';

const Navigation = ({ onNavigate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  // Check authentication status on component mount and when navigation changes
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = getAuthToken();
      setIsAuthenticated(!!token);
      setUserRole(getUserRole());
      setUserName(getUserName());
    };

    checkAuthStatus();
    
    // Listen for storage events to update auth status when token changes
    const handleStorageChange = () => {
      checkAuthStatus();
    };
    
    // Listen for custom auth status change events
    const handleAuthStatusChange = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStatusChanged', handleAuthStatusChange);
    
    // Also check periodically in case token expires
    const interval = setInterval(checkAuthStatus, 30000); // Check every 30 seconds
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStatusChanged', handleAuthStatusChange);
      clearInterval(interval);
    };
  }, []);

  const handleNavigation = (page, e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const handleSignOut = (e) => {
    e.preventDefault();
    clearAuthToken();
    setIsAuthenticated(false);
    
    // Dispatch custom event to notify other components of auth status change
    window.dispatchEvent(new Event('authStatusChanged'));
    
    console.log('User signed out');
    
    // Navigate to home page after sign out
    if (onNavigate) {
      onNavigate('home');
    }
  };

  return (
    <nav className="mx-auto flex max-w-6xl items-center justify-between py-4">
      <div className="leading-loose">
        <a 
          href="/" 
          className="font-bold text-3xl"
          onClick={(e) => handleNavigation('home', e)}
        >
          Restaurant Reviews
        </a>
      </div>

      <div className="leading-loose">
        {isAuthenticated ? (
          // Authenticated user navigation
          <><span className="text-sm font-semibold text-gray-700 px-3">
            Welcome, {userName || 'User'}!
          </span>
            {userRole === 'Restaurant' && (
              <>
                <a
                  href="/my-restaurants"
                  className="text-sm font-semibold text-blue-500 px-3"
                  onClick={(e) => handleNavigation('my-restaurants', e)}
                >
                  Manage Restaurants
                </a>
              </>
            )}
            
            <a 
              href="#" 
              className="text-sm font-semibold text-blue-500 px-3"
              onClick={handleSignOut}
            >
              Sign out
            </a>
          </>
        ) : (
          // Non-authenticated user navigation
          <>
            <a 
              href="/login" 
              className="text-sm font-semibold text-blue-500 px-3"
              onClick={(e) => handleNavigation('login', e)}
            >
              Sign in
            </a>
            <a 
              href="/register" 
              className="text-sm font-semibold text-blue-500 px-3"
              onClick={(e) => handleNavigation('register', e)}
            >
              Register
            </a>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;