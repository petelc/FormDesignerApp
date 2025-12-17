// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export enum UserRole {
  ADMIN = 'Admin',
  FORM_CREATOR = 'FormCreator',
  FORM_VIEWER = 'FormViewer',
  USER = 'User',
}

// Pagination Types
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// API Response Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
  timestamp?: string;
  path?: string;
}

// Common Status Type
export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
