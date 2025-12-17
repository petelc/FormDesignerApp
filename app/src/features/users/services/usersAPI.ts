import apiClient from '@/services/api/client';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserFilters,
} from '../types';
import { PaginatedResponse, PaginationParams } from '@/shared/types';

export const usersAPI = {
  /**
   * Get all users with pagination and filters
   */
  getUsers: async (
    pagination: PaginationParams,
    filters?: UserFilters
  ): Promise<PaginatedResponse<User>> => {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters,
    };
    const response = await apiClient.get<PaginatedResponse<User>>('/api/users', { params });
    return response.data;
  },

  /**
   * Get a single user by ID
   */
  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get<User>(`/api/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user (Admin only)
   */
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<User>('/api/users', data);
    return response.data;
  },

  /**
   * Update an existing user (Admin only)
   */
  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<User>(`/api/users/${id}`, data);
    return response.data;
  },

  /**
   * Delete a user (Admin only)
   */
  deleteUser: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/api/users/${id}`);
    return response.data;
  },

  /**
   * Toggle user active status (Admin only)
   */
  toggleUserStatus: async (id: string): Promise<User> => {
    const response = await apiClient.patch<User>(`/api/users/${id}/toggle-status`);
    return response.data;
  },

  /**
   * Change user password (Self or Admin)
   */
  changePassword: async (id: string, data: ChangePasswordRequest): Promise<{ success: boolean }> => {
    const response = await apiClient.post(`/api/users/${id}/change-password`, data);
    return response.data;
  },

  /**
   * Reset user password (Admin only)
   */
  resetPassword: async (id: string): Promise<{ temporaryPassword: string }> => {
    const response = await apiClient.post(`/api/users/${id}/reset-password`);
    return response.data;
  },
};
