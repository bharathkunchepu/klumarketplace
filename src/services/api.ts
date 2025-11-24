import axios, { AxiosError } from 'axios';
import { toastUtils } from '../utils/toast';
import { ErrorMessages } from '../utils/errorMessages';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

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
      localStorage.removeItem('authToken');
      // Only show toast if not on login page
      if (window.location.pathname !== '/login') {
        toastUtils.showAuthError(ErrorMessages.AUTH.TOKEN_EXPIRED);
      }
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

