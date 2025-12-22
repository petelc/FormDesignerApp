import apiClient from '@/services/api/client';
import {
  FormProject,
  CreateProjectRequest,
  UpdateProjectRequest,
  ProjectFilters,
  ProjectStatus,
} from '../types';
import { PaginatedResponse, PaginationParams } from '@/shared/types';

// Backend API response structure
interface BackendPagedProjectsResult {
  projects: FormProject[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const projectsAPI = {
  /**
   * Get all projects with pagination and filters
   */
  getProjects: async (
    pagination: PaginationParams,
    filters?: ProjectFilters
  ): Promise<PaginatedResponse<FormProject>> => {
    const params: Record<string, string | number | undefined> = {
      page: pagination.page,
      pageSize: pagination.pageSize,
    };
    
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key as keyof ProjectFilters];
        if (value !== undefined && value !== null && value !== '') {
          params[key] = value;
        }
      });
    }
    
    const response = await apiClient.get<BackendPagedProjectsResult>('/api/projects', {
      params,
    });
    
    const backendData = response.data;
    
    console.log('Backend API response:', backendData);
    
    // Map backend response structure to frontend structure
    return {
      data: backendData.projects,
      page: backendData.pageNumber,
      pageSize: backendData.pageSize,
      totalCount: backendData.totalCount,
      totalPages: backendData.totalPages,
    };
  },

  /**
   * Get a single project by ID
   */
  getProject: async (id: string): Promise<FormProject> => {
    const response = await apiClient.get<FormProject>(`/api/projects/${id}`);
    const project = response.data;
    
    // If analysis is complete, fetch and include the results
    // Check both enum values and string values from backend
    const statusString = project.status as string;
    if (project.status === ProjectStatus.ANALYSIS_COMPLETE || 
        project.status === ProjectStatus.STRUCTURE_REVIEWED ||
        project.status === ProjectStatus.CODE_GENERATED ||
        project.status === ProjectStatus.COMPLETED ||
        statusString === 'ANALYSING_COMPLETE') {
      try {
        const analysisResponse = await apiClient.get(`/api/projects/${id}/analysis-result`);
        project.documentIntelligenceResult = analysisResponse.data;
        console.log('Merged analysis result into project:', analysisResponse.data);
      } catch (error) {
        console.warn('Could not fetch analysis result:', error);
      }
    }
    
    return project;
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
  uploadPdf: async (
    projectId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<FormProject> => {
    const formData = new FormData();
    formData.append('pdfFile', file);

    const response = await apiClient.post<FormProject>(
      `/api/projects/${projectId}/upload-pdf`,
      formData,
      {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            // Calculate actual upload progress (0-90%)
            // Reserve 10% for server processing
            const uploadProgress = Math.round(
              (progressEvent.loaded * 90) / progressEvent.total
            );
            console.log(`Upload progress: ${progressEvent.loaded}/${progressEvent.total} = ${uploadProgress}%`);
            onProgress?.(uploadProgress);
          }
        },
      }
    );
    
    // Upload complete, show processing
    console.log('Upload complete, server processing...');
    onProgress?.(95);
    
    return response.data;
  },

  /**
   * Start document intelligence analysis
   */
  startAnalysis: async (projectId: string): Promise<{ jobId: string; message: string }> => {
    const response = await apiClient.post(`/api/projects/${projectId}/analyze`, {});
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
    console.log('Analysis result:', response.data);
    return response.data;
  },

  /**
   * Generate code for project
   */
  generateProjectCode: async (
    projectId: string,
    options: { template: string; includeTests?: boolean; includeDocumentation?: boolean }
  ): Promise<any> => {
    const response = await apiClient.post(
      `/api/projects/${projectId}/generate-code`,
      options
    );
    return response.data;
  },
};
