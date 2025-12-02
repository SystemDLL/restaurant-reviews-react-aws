// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://v7iaungqoc.execute-api.us-east-1.amazonaws.com/v1/',
  ENDPOINTS: {
    RESTAURANTS: '',
    LOGIN: 'login',
    REGISTER: 'register',
    PROCESS: 'process',
  },
  TIMEOUT: 10000, // 10 seconds
  IMAGE_BASE_URL: 'https://d2kedliktzuk92.cloudfront.net/assets/images/',
};

// Helper function to build full URL
export const buildApiUrl = (endpoint = '') => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get JWT token from cookies
export const getAuthToken = () => {
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => cookie.trim().startsWith('authToken='));
  return authCookie ? authCookie.split('=')[1] : null;
};

// Helper function to get Role from cookies
export const getUserRole = () => {
  const cookies = document.cookie.split(';');
  const roleCookie = cookies.find(cookie => cookie.trim().startsWith('role='));
  return roleCookie ? roleCookie.split('=')[1] : null;
};

// Helper function to get Name from cookies
export const getUserName = () => {
  const cookies = document.cookie.split(';');
  const nameCookie = cookies.find(cookie => cookie.trim().startsWith('name='));
  return nameCookie ? decodeURIComponent(nameCookie.split('=')[1]) : null;
};

// Helper function to make authenticated API calls
export const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();
  
  const defaultHeaders = {};
  
  // Only set Content-Type if not FormData (let browser set it for FormData)
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  return fetch(url, config);
};

// Helper function to clear auth token (for logout)
export const clearAuthToken = () => {
  document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'name=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

export const readImageAsDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      resolve(dataUrl.split(',')[1]); // Return only base64 string
    };
    reader.onerror = (e) => {
      console.error('FileReader error:', e);
      reject(e);
    };
    reader.readAsDataURL(file);
  });
};

export default API_CONFIG;