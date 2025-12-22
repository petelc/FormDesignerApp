import { AxiosError } from 'axios';
import { ApiError } from '@/shared/types';

/**
 * Parse API error response and return user-friendly message
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof AxiosError) {
    // Handle network errors (no response received)
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return 'Request timeout. Please try again.';
      }
      if (error.code === 'ERR_NETWORK') {
        return 'Cannot connect to server. Please check if the backend is running.';
      }
      if (error.message.includes('Network Error')) {
        return 'Network error. Please check your connection and ensure the server is running.';
      }
      return error.message || 'Cannot connect to server. Please try again.';
    }

    const apiError = error.response?.data as ApiError | undefined;

    if (apiError?.message) {
      return apiError.message;
    }

    // Handle specific status codes
    const status = error.response?.status;
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict occurred. Resource may already exist.';
      case 422:
        return 'Validation failed. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
};

/**
 * Extract validation errors from API response
 */
export const extractValidationErrors = (error: unknown): Record<string, string> | null => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError | undefined;
    
    if (apiError?.errors) {
      // Convert array of errors to single string per field
      const errors: Record<string, string> = {};
      Object.entries(apiError.errors).forEach(([field, messages]) => {
        errors[field] = messages[0]; // Take first error message
      });
      return errors;
    }
  }
  
  return null;
};
