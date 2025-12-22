import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Log the API base URL for debugging
console.log('API Base URL:', API_BASE_URL);

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - Add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from Redux store or localStorage
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - let the browser handle it
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    // Better error logging
    if (!error.response) {
      // Network error - no response received
      console.error('Network Error:', {
        message: error.message,
        url: error.config?.url,
        code: error.code,
        detail: 'No response from server. Server may be down or CORS is blocking the request.',
      });
    } else {
      // Server responded with error
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
      });
    }
    
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle network errors (no response from server)
    if (!error.response) {
      // Add user-friendly error message
      const networkError = new Error(
        `Cannot connect to server at ${API_BASE_URL}. Please check if the backend is running.`
      ) as AxiosError;
      networkError.config = error.config;
      networkError.code = error.code;
      return Promise.reject(networkError);
    }

    // Handle 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/refresh`, {
            refreshToken,
          });

          const { token } = response.data;
          localStorage.setItem('token', token);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
