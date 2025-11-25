import axios, { AxiosError } from 'axios';
import { toastUtils } from '../utils/toast';
import { ErrorMessages } from '../utils/errorMessages';

// Get API base URL from environment variable
// In production, this MUST be set via VITE_API_BASE_URL environment variable
// In development, falls back to localhost if not set
const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  
  // In production, check if the environment variable is properly set
  if (import.meta.env.PROD) {
    // Check if URL is missing, empty, or contains localhost
    const isInvalid = !envUrl || 
                     (typeof envUrl === 'string' && envUrl.trim() === '') || 
                     (typeof envUrl === 'string' && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1')));
    
    if (isInvalid) {
      const errorMsg = '❌ ERROR: VITE_API_BASE_URL is not properly configured for production!';
      console.error(errorMsg);
      console.error('Current value:', envUrl || '(undefined)');
      console.error('Please ensure VITE_API_BASE_URL is set in your deployment environment.');
      console.error('Expected format: https://your-backend-url.com/api/v1');
      // Don't throw - allow app to load but API calls will fail with clear errors
      // This prevents the entire app from crashing
      return ''; // Return empty string so API calls fail gracefully
    }
    return envUrl;
  }
  
  // In development, fallback to localhost
  return envUrl || 'http://localhost:8080/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

// Log API URL for debugging
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL (DEV):', API_BASE_URL);
} else if (import.meta.env.PROD) {
  console.log('🔗 API Base URL (PROD):', API_BASE_URL || '(NOT SET - API calls will fail)');
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  // Don't set default Content-Type here - set it conditionally in interceptor
});

// Request interceptor to add token and handle Content-Type
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // DO NOT modify Content-Type when sending FormData.
    // The browser MUST set it automatically.
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    } else if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
      // For JSON requests, set Content-Type if not already set
      if (!config.headers['Content-Type'] && !config.headers['content-type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 - Unauthorized (token expired/invalid)
    if (error.response?.status === 401) {
      // Check if we're currently on the login or signup page FIRST
      // This is the most important check - never redirect if we're already on auth pages
      const currentPath = window.location.pathname;
      const isOnAuthPage = currentPath === '/login' || currentPath === '/signup';

      // Get the request URL to check if it's a login/signup request
      const requestUrl = (error.config?.url || '').toLowerCase();

      // Check if this is an auth endpoint (login/signup)
      // The URL could be '/auth/login', '/api/v1/auth/login', or full URL
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.endsWith('/auth/login') ||
        requestUrl.endsWith('/auth/register');

      // DEBUG: Log interceptor behavior
      console.log('🔍 API Interceptor - 401 Error:', {
        currentPath,
        isOnAuthPage,
        requestUrl,
        isAuthEndpoint,
        willRedirect: !(isOnAuthPage || isAuthEndpoint)
      });

      // CRITICAL: If we're on auth pages OR it's an auth endpoint, NEVER redirect
      // This prevents page reloads during login/signup attempts
      if (isOnAuthPage || isAuthEndpoint) {
        console.log('✅ API Interceptor: Allowing component to handle error (no redirect)');
        // Don't remove token for auth endpoint errors - let the component handle it
        return Promise.reject(error);
      }

      // For other endpoints (token expired), remove token and redirect to login
      // This should only happen when user is on other pages and their token expired
      console.warn('⚠️ API Interceptor: Redirecting to login (token expired on other page)');
      localStorage.removeItem('authToken');
      toastUtils.showAuthError(ErrorMessages.AUTH.TOKEN_EXPIRED);
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Handle network errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      toastUtils.showNetworkError();
      return Promise.reject(error);
    }

    // Handle timeout errors
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      toastUtils.error(ErrorMessages.NETWORK.TIMEOUT);
      return Promise.reject(error);
    }

    // Handle server errors (500, 503, etc.)
    if (error.response?.status && error.response.status >= 500) {
      toastUtils.showServerError();
      return Promise.reject(error);
    }

    // Handle service unavailable
    if (error.response?.status === 503) {
      toastUtils.error(ErrorMessages.API.SERVICE_UNAVAILABLE);
      return Promise.reject(error);
    }

    // For other errors, let the component handle them
    return Promise.reject(error);
  }
);

export default api;

