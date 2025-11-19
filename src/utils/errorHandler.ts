import { AxiosError } from 'axios';

export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    if (error.response) {
      // Server responded with error
      const status = error.response.status;
      const message = error.response.data?.message || 'An error occurred';

      switch (status) {
        case 400:
          return message || 'Invalid request. Please check your input.';
        case 401:
          return 'Please login to continue.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'Resource not found.';
        case 423:
          return 'Account is locked. Please try again later.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return message || 'An error occurred. Please try again.';
      }
    } else if (error.request) {
      // Request made but no response
      return 'Network error. Please check your connection.';
    }
  }

  // Something else happened
  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};

