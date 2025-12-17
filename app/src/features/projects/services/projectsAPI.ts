import apiClient from '@/services/api/client';
import {
  FormProject,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectFilters,
} from '../types';
import { PaginatedResponse, PaginationParams } from '@/shared/types';

export const projectsAPI = {
  /**
   * Get all projects with pagination and filters
   */
  getProjects: async (
    pagination: PaginationParams,
    filters?: ProjectFilters
  ): Promise<PaginatedResponse<FormProject>> => {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...filters,
    };
    const response = await apiClient.get<PaginatedResponse<FormProject>>('/api/projects', {
      params,
    });
    return response.data;
  },

  /**
   * Get a single project by ID
   */
  getProject: async (id: string): Promise<FormProject> => {
    const response = await apiClient.get<FormProject>(`/api/projects/${id}`);
    return response.data;
  },

  /**
   * Create a new project
   */
  createProject: async (data: CreateProjectRequest): Promise<FormProject> => {
    const response = await apiClient.post<FormProject>('/api/projects', data);
    return response.data;
  },

  /**
   * Update an existing project
   */
  updateProject: async (id: string, data: UpdateProjectRequest): Promise<FormProject> => {
    const response = await apiClient.put<FormProject>(`/api/projects/${id}`, data);
    return response.data;
  },

  /**
   * Delete a project
   */
  deleteProject: async (id: string): Promise<{ success: boolean }> => {
    const response = await apiClient.delete(`/api/projects/${id}`);
    return response.data;
  },

  /**
   * Upload PDF to a project
   */
  uploadPdf: async (projectId: string, file: File): Promise<FormProject> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<FormProject>(
      `/api/projects/${projectId}/upload-pdf`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * Start document intelligence analysis
   */
  startAnalysis: async (projectId: string): Promise<{ jobId: string; message: string }> => {
    const response = await apiClient.post(`/api/projects/${projectId}/analyze`);
    return response.data;
  },

  /**
   * Get analysis status
   */
  getAnalysisStatus: async (projectId: string): Promise<{
    status: string;
    progress?: number;
    message?: string;
  }> => {
    const response = await apiClient.get(`/api/projects/${projectId}/analysis-status`);
    return response.data;
  },

  /**
   * Get analysis result
   */
  getAnalysisResult: async (projectId: string): Promise<any> => {
    const response = await apiClient.get(`/api/projects/${projectId}/analysis-result`);
    return response.data;
  },
};
