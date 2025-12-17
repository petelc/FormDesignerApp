import { ExtractedFormStructure } from '@/features/document-intelligence/types';

export enum CodeTemplate {
  REACT_TYPESCRIPT = 'REACT_TYPESCRIPT',
  REACT_JAVASCRIPT = 'REACT_JAVASCRIPT',
  REACT_NATIVE = 'REACT_NATIVE',
  VUE = 'VUE',
  ANGULAR = 'ANGULAR',
}

export enum BackendFramework {
  EXPRESS = 'EXPRESS',
  NESTJS = 'NESTJS',
  FASTAPI = 'FASTAPI',
  DJANGO = 'DJANGO',
  SPRING_BOOT = 'SPRING_BOOT',
}

export enum ValidationLibrary {
  YUP = 'YUP',
  ZOD = 'ZOD',
  JOI = 'JOI',
  CLASS_VALIDATOR = 'CLASS_VALIDATOR',
}

export interface CodeGenerationOptions {
  template: CodeTemplate;
  backendFramework?: BackendFramework;
  validationLibrary?: ValidationLibrary;
  includeTests?: boolean;
  includeDocumentation?: boolean;
  includeBackend?: boolean;
  styling?: 'tailwind' | 'bootstrap' | 'mui' | 'css';
  formLibrary?: 'formik' | 'react-hook-form' | 'none';
}

export interface GeneratedFile {
  path: string;
  name: string;
  content: string;
  language: string;
}

export interface GeneratedCode {
  files: GeneratedFile[];
  structure: {
    frontend: string[];
    backend: string[];
    tests: string[];
    docs: string[];
  };
  metadata: {
    template: CodeTemplate;
    generatedAt: string;
    fileCount: number;
  };
}

export interface CodeGenerationRequest {
  formStructure: ExtractedFormStructure;
  options: CodeGenerationOptions;
  projectName: string;
}

export interface CodeGenerationResult {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  generatedCode?: GeneratedCode;
  downloadUrl?: string;
  errorMessage?: string;
  progress?: number;
}
