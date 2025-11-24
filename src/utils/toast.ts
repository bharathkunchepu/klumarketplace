import { toast } from 'react-toastify';
import type { ToastOptions } from 'react-toastify';
import { ErrorMessages, extractErrorMessage } from './errorMessages';

/**
 * Toast notification utility
 * Provides consistent toast notifications throughout the application
 */

const defaultToastOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

export const toastUtils = {
  /**
   * Show success toast
   */
  success: (message: string, options?: ToastOptions) => {
    toast.success(message, { ...defaultToastOptions, ...options });
  },

  /**
   * Show error toast
   */
  error: (message: string, options?: ToastOptions) => {
    toast.error(message, { ...defaultToastOptions, ...options });
  },

  /**
   * Show warning toast
   */
  warning: (message: string, options?: ToastOptions) => {
    toast.warning(message, { ...defaultToastOptions, ...options });
  },

  /**
   * Show info toast
   */
  info: (message: string, options?: ToastOptions) => {
    toast.info(message, { ...defaultToastOptions, ...options });
  },

  /**
   * Show error from API error object
   */
  showApiError: (error: any, customMessage?: string) => {
    const message = customMessage || extractErrorMessage(error);
    toast.error(message, { ...defaultToastOptions });
  },

  /**
   * Show network error
   */
  showNetworkError: () => {
    toast.error(ErrorMessages.NETWORK.CONNECTION_ERROR, { ...defaultToastOptions });
  },

  /**
   * Show server error
   */
  showServerError: () => {
    toast.error(ErrorMessages.API.INTERNAL_ERROR, { ...defaultToastOptions });
  },

  /**
   * Show authentication error
   */
  showAuthError: (message?: string) => {
    toast.error(message || ErrorMessages.AUTH.UNAUTHORIZED, { ...defaultToastOptions });
  },

  /**
   * Show success message for login
   */
  showLoginSuccess: () => {
    toast.success(ErrorMessages.SUCCESS.LOGIN_SUCCESS, { ...defaultToastOptions });
  },

  /**
   * Show success message for registration
   */
  showRegistrationSuccess: () => {
    toast.success(ErrorMessages.SUCCESS.REGISTRATION_SUCCESS, { ...defaultToastOptions });
  },

  /**
   * Show success message for logout
   */
  showLogoutSuccess: () => {
    toast.success(ErrorMessages.SUCCESS.LOGOUT_SUCCESS, { ...defaultToastOptions });
  },
};

export default toastUtils;

