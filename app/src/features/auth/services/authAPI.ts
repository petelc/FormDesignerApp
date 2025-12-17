import apiClient from '@/services/api/client';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../types';
import { User } from '@/shared/types';

export const authAPI = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', credentials);
    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/api/auth/register', data);
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (refreshToken: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post('/api/auth/logout', { refreshToken });
    return response.data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<{ token: string; expiresIn: number }> => {
    const response = await apiClient.post('/api/auth/refresh', { refreshToken });
    return response.data;
  },

  /**
   * Get current user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/api/auth/me');
    return response.data;
  },

  /**
   * Forgot password
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Reset password
   */
  resetPassword: async (data: ResetPasswordRequest): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/reset-password', data);
    return response.data;
  },
};
