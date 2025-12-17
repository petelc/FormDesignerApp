import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../services/authAPI';
import { AuthState, LoginRequest, RegisterRequest } from '../types';
import { handleApiError } from '@/shared/utils/errorHandler';
import { STORAGE_KEYS } from '@/shared/constants';
import { addToast } from '@/shared/components/ui/toastSlice';

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem(STORAGE_KEYS.TOKEN),
  refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
  isAuthenticated: !!localStorage.getItem(STORAGE_KEYS.TOKEN),
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue, dispatch }) => {
    try {
      const response = await authAPI.login(credentials);
      
      // Store tokens
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      
      dispatch(addToast({ message: 'Login successful!', type: 'success' }));
      
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch(addToast({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue, dispatch }) => {
    try {
      const response = await authAPI.register(data);
      
      // Store tokens
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      
      dispatch(addToast({ message: 'Account created successfully!', type: 'success' }));
      
      return response;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch(addToast({ message: errorMessage, type: 'error' }));
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async (_, { getState, dispatch }) => {
  const state = getState() as { auth: AuthState };
  const { refreshToken } = state.auth;

  try {
    if (refreshToken) {
      await authAPI.logout(refreshToken);
    }
  } catch (error) {
    // Ignore logout errors, proceed with local cleanup
    console.error('Logout error:', error);
  }

  // Clear local storage
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  
  dispatch(addToast({ message: 'Logged out successfully', type: 'info' }));
});

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authAPI.getCurrentUser();
      return user;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string; user: any }>
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.isAuthenticated = false;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // Get current user
    builder.addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(getCurrentUser.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    });
  },
});

export const { clearError, setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
