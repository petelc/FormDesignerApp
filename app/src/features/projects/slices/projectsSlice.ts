import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { projectsAPI } from '../services/projectsAPI';
import {
  FormProject,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectFilters,
} from '../types';
import { PaginationParams, PaginatedResponse } from '@/shared/types';
import { handleApiError } from '@/shared/utils/errorHandler';

interface ProjectsState {
  items: FormProject[];
  currentProject: FormProject | null;
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
  filters: ProjectFilters;
  
  // Upload state
  uploadProgress: number;
  isUploading: boolean;
  uploadError: string | null;
}

const initialState: ProjectsState = {
  items: [],
  currentProject: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  uploadProgress: 0,
  isUploading: false,
  uploadError: null,
};

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (
    { pagination, filters }: { pagination?: PaginationParams; filters?: ProjectFilters },
    { rejectWithValue }
  ) => {
    try {
      const paginationParams = pagination || { page: 1, pageSize: 10 };
      console.log('Fetching projects with params:', { paginationParams, filters });
      const response = await projectsAPI.getProjects(paginationParams, filters);
      console.log('Projects API response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const fetchProject = createAsyncThunk(
  'projects/fetchProject',
  async (id: string, { rejectWithValue }) => {
    try {
      const project = await projectsAPI.getProject(id);
      return project;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (data: CreateProjectRequest, { rejectWithValue }) => {
    try {
      const project = await projectsAPI.createProject(data);
      return project;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: string; data: UpdateProjectRequest }, { rejectWithValue }) => {
    try {
      const project = await projectsAPI.updateProject(id, data);
      return project;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: string, { rejectWithValue }) => {
    try {
      await projectsAPI.deleteProject(id);
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

export const uploadPdf = createAsyncThunk(
  'projects/uploadPdf',
  async ({ projectId, file }: { projectId: string; file: File }, { rejectWithValue }) => {
    try {
      const project = await projectsAPI.uploadPdf(projectId, file);
      return project;
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  }
);

// Slice
const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUploadError: (state) => {
      state.uploadError = null;
    },
    setFilters: (state, action: PayloadAction<ProjectFilters>) => {
      state.filters = action.payload;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch projects
    builder.addCase(fetchProjects.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProjects.fulfilled, (state, action: PayloadAction<PaginatedResponse<FormProject>>) => {
      state.isLoading = false;
      state.items = action.payload.data;
      state.pagination = {
        page: action.payload.page,
        pageSize: action.payload.pageSize,
        total: action.payload.totalCount,
        totalPages: action.payload.totalPages,
      };
    });
    builder.addCase(fetchProjects.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch single project
    builder.addCase(fetchProject.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchProject.fulfilled, (state, action: PayloadAction<FormProject>) => {
      state.isLoading = false;
      state.currentProject = action.payload;
    });
    builder.addCase(fetchProject.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Create project
    builder.addCase(createProject.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createProject.fulfilled, (state, action: PayloadAction<FormProject>) => {
      state.isLoading = false;
      state.items.unshift(action.payload);
      state.currentProject = action.payload;
    });
    builder.addCase(createProject.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update project
    builder.addCase(updateProject.fulfilled, (state, action: PayloadAction<FormProject>) => {
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.currentProject?.id === action.payload.id) {
        state.currentProject = action.payload;
      }
    });

    // Delete project
    builder.addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
      if (state.currentProject?.id === action.payload) {
        state.currentProject = null;
      }
    });

    // Upload PDF
    builder.addCase(uploadPdf.pending, (state) => {
      state.isUploading = true;
      state.uploadError = null;
      state.uploadProgress = 0;
    });
    builder.addCase(uploadPdf.fulfilled, (state, action: PayloadAction<FormProject>) => {
      state.isUploading = false;
      state.uploadProgress = 100;
      state.currentProject = action.payload;
      
      // Update in list
      const index = state.items.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    });
    builder.addCase(uploadPdf.rejected, (state, action) => {
      state.isUploading = false;
      state.uploadProgress = 0;
      state.uploadError = action.payload as string;
    });
  },
});

export const {
  clearError,
  clearUploadError,
  setFilters,
  clearCurrentProject,
  setUploadProgress,
} = projectsSlice.actions;

export default projectsSlice.reducer;
