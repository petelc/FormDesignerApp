// Application Constants
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Form Designer';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const TOKEN_REFRESH_INTERVAL = Number(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL) || 840000; // 14 minutes

// File Upload
export const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE) || 10485760; // 10MB
export const ALLOWED_FILE_TYPES = ['application/pdf'];
export const ALLOWED_FILE_EXTENSIONS = ['.pdf'];

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Polling
export const POLLING_INTERVAL = 2000; // 2 seconds
export const MAX_POLLING_ATTEMPTS = 60; // 2 minutes max

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // App routes
  APP: '/app',
  DASHBOARD: '/app/dashboard',
  PROJECTS: '/app/projects',
  PROJECT_DETAIL: '/app/projects/:id',
  PROJECT_NEW: '/app/projects/new',
  USERS: '/app/users',
  
  // Not found
  NOT_FOUND: '*',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Unauthorized. Please log in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Validation failed. Please check your input.',
  FILE_TOO_LARGE: `File is too large. Maximum size is ${MAX_FILE_SIZE / 1048576}MB.`,
  INVALID_FILE_TYPE: 'Invalid file type. Only PDF files are allowed.',
} as const;
