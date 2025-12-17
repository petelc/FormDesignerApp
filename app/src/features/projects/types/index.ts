import { User } from '@/shared/types';

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PDF_UPLOADED = 'PDF_UPLOADED',
  ANALYZING = 'ANALYZING',
  ANALYSIS_COMPLETE = 'ANALYSIS_COMPLETE',
  STRUCTURE_REVIEWED = 'STRUCTURE_REVIEWED',
  GENERATING_CODE = 'GENERATING_CODE',
  CODE_GENERATED = 'CODE_GENERATED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface FormProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  
  // PDF related
  originalPdfUrl?: string;
  originalPdfFileName?: string;
  originalPdfSize?: number;
  
  // Document Intelligence
  documentIntelligenceJobId?: string;
  documentIntelligenceStatus?: string;
  documentIntelligenceResult?: any; // Will be typed more specifically later
  
  // Form Definition
  formDefinition?: any; // Will be typed more specifically later
  
  // Code Generation
  codeGenerationJobId?: string;
  codeGenerationStatus?: string;
  generatedCode?: any; // Will be typed more specifically later
  selectedTemplate?: string;
  
  // Metadata
  createdBy: string;
  createdByUser?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description: string;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface ProjectFilters {
  status?: ProjectStatus;
  createdBy?: string;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
  sortOrder?: 'asc' | 'desc';
}
