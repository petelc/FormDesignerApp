import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { usersAPI } from '../services/usersAPI';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
} from '../types';
import { PaginationParams, PaginatedResponse } from '@/shared/types';
import { handleApiError } from '@/shared/utils/errorHandler';

interface UsersState {
  items: User[];
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  
  // Filters
  filters: UserFilters;
}

const initialState: UsersState = {
  items: [],
  currentUser: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (
    { pagination, filters }: { pagination?: PaginationParams; filters?: UserFilters },
    { rejectWithValue }
  ) => {
    try {
      const paginationParams = pagination || { page: 1, pageSize: 10 };
      const response = await usersAPI.getUsers(paginationParams, filters);
      return response;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (id: string, { rejectWithValue }) => {
    try {
      const user = await usersAPI.getUser(id);
      return user;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (data: CreateUserRequest, { rejectWithValue }) => {
    try {
      const user = await usersAPI.createUser(data);
      return user;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }: { id: string; data: UpdateUserRequest }, { rejectWithValue }) => {
    try {
      const user = await usersAPI.updateUser(id, data);
      return user;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await usersAPI.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  'users/toggleUserStatus',
  async (id: string, { rejectWithValue }) => {
    try {
      const user = await usersAPI.toggleUserStatus(id);
      return user;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<UserFilters>) => {
      state.filters = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder.addCase(fetchUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<PaginatedResponse<User>>) => {
      state.isLoading = false;
      state.items = action.payload.data;
      state.pagination = {
        page: action.payload.page,
        pageSize: action.payload.pageSize,
        total: action.payload.totalCount,
        totalPages: action.payload.totalPages,
      };
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch single user
    builder.addCase(fetchUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.currentUser = action.payload;
    });
    builder.addCase(fetchUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create user
    builder.addCase(createUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.items.unshift(action.payload);
    });
    builder.addCase(createUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update user
    builder.addCase(updateUser.fulfilled, (state, action: PayloadAction<User>) => {
      const index = state.items.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentUser?.id === action.payload.id) {
        state.currentUser = action.payload;
      }
    });

    // Delete user
    builder.addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((u) => u.id !== action.payload);
      if (state.currentUser?.id === action.payload) {
        state.currentUser = null;
      }
    });

    // Toggle user status
    builder.addCase(toggleUserStatus.fulfilled, (state, action: PayloadAction<User>) => {
      const index = state.items.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentUser?.id === action.payload.id) {
        state.currentUser = action.payload;
      }
    });
  },
});

export const { clearError, setFilters, clearCurrentUser } = usersSlice.actions;
export default usersSlice.reducer;
