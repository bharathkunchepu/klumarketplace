/**
 * Centralized error messages for the application
 * These messages are used for both toast notifications and inline form errors
 */

export const ErrorMessages = {
  // Authentication Errors
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password. Please try again.',
    ACCOUNT_NOT_FOUND: 'No account found with this email address.',
    ACCOUNT_LOCKED: 'Your account has been locked. Please contact support.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    LOGIN_REQUIRED: 'Please log in to continue.',
    LOGOUT_FAILED: 'Failed to log out. Please try again.',
  },

  // Registration Errors
  REGISTRATION: {
    EMAIL_EXISTS: 'An account with this email already exists.',
    UNIVERSITY_ID_EXISTS: 'This university ID is already registered.',
    INVALID_EMAIL_DOMAIN: 'Email must be a KL University email (@kluniversity.edu).',
    WEAK_PASSWORD: 'Password does not meet security requirements.',
    INVALID_UNIVERSITY_ID: 'Invalid university ID format.',
    REGISTRATION_FAILED: 'Registration failed. Please try again.',
  },

  // Validation Errors
  VALIDATION: {
    EMAIL_REQUIRED: 'Email is required.',
    EMAIL_INVALID: 'Please enter a valid email address.',
    PASSWORD_REQUIRED: 'Password is required.',
    PASSWORD_TOO_SHORT: 'Password must be at least 8 characters.',
    PASSWORD_TOO_LONG: 'Password must be 100 characters or less.',
    PASSWORD_NO_LOWERCASE: 'Password must contain at least one lowercase letter.',
    PASSWORD_NO_UPPERCASE: 'Password must contain at least one uppercase letter.',
    PASSWORD_NO_NUMBER: 'Password must contain at least one number.',
    FIRST_NAME_REQUIRED: 'First name is required.',
    FIRST_NAME_TOO_SHORT: 'First name must be at least 2 characters.',
    FIRST_NAME_TOO_LONG: 'First name must be 50 characters or less.',
    LAST_NAME_REQUIRED: 'Last name is required.',
    LAST_NAME_TOO_SHORT: 'Last name must be at least 2 characters.',
    LAST_NAME_TOO_LONG: 'Last name must be 50 characters or less.',
    UNIVERSITY_ID_REQUIRED: 'University ID is required.',
    UNIVERSITY_ID_TOO_LONG: 'University ID must be 20 characters or less.',
  },

  // Network Errors
  NETWORK: {
    CONNECTION_ERROR: 'Unable to connect to the server. Please check your internet connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error occurred. Please try again later.',
    UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  },

  // API Errors
  API: {
    BAD_REQUEST: 'Invalid request. Please check your input.',
    NOT_FOUND: 'The requested resource was not found.',
    FORBIDDEN: 'You do not have permission to access this resource.',
    INTERNAL_ERROR: 'An internal server error occurred. Please try again later.',
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.',
  },

  // Success Messages
  SUCCESS: {
    LOGIN_SUCCESS: 'Welcome back!',
    REGISTRATION_SUCCESS: 'Account created successfully!',
    LOGOUT_SUCCESS: 'You have been logged out successfully.',
    PROFILE_UPDATED: 'Profile updated successfully.',
    PASSWORD_CHANGED: 'Password changed successfully.',
  },
};

/**
 * Maps HTTP status codes to error messages
 */
export const getErrorMessageFromStatus = (status: number): string => {
  switch (status) {
    case 400:
      return ErrorMessages.API.BAD_REQUEST;
    case 401:
      return ErrorMessages.AUTH.UNAUTHORIZED;
    case 403:
      return ErrorMessages.API.FORBIDDEN;
    case 404:
      return ErrorMessages.API.NOT_FOUND;
    case 500:
      return ErrorMessages.API.INTERNAL_ERROR;
    case 503:
      return ErrorMessages.API.SERVICE_UNAVAILABLE;
    default:
      return ErrorMessages.NETWORK.UNKNOWN_ERROR;
  }
};

/**
 * Extracts error message from API error response
 */
export const extractErrorMessage = (error: any): string => {
  // Check if error has a response with data
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  // Check if error has a message
  if (error?.message) {
    // Handle network errors
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      return ErrorMessages.NETWORK.CONNECTION_ERROR;
    }
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return ErrorMessages.NETWORK.TIMEOUT;
    }
    return error.message;
  }

  // Check status code
  if (error?.response?.status) {
    return getErrorMessageFromStatus(error.response.status);
  }

  // Default error message
  return ErrorMessages.NETWORK.UNKNOWN_ERROR;
};

/**
 * Determines if an error should be shown as inline form error or toast
 */
export const shouldShowInlineError = (errorMessage: string, field: string): boolean => {
  // Validation errors should always be inline
  const validationKeywords = ['required', 'must be', 'must contain', 'invalid format', 'too short', 'too long'];
  if (validationKeywords.some(keyword => errorMessage.toLowerCase().includes(keyword))) {
    return true;
  }

  // Field-specific errors should be inline
  if (errorMessage.toLowerCase().includes(field.toLowerCase())) {
    return true;
  }

  // Email exists, university ID exists - inline
  if (errorMessage.toLowerCase().includes('already exists') || 
      errorMessage.toLowerCase().includes('already registered')) {
    return field === 'email' || field === 'universityId';
  }

  // Default to toast for API errors
  return false;
};

