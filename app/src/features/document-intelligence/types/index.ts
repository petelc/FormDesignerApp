export enum AnalysisStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum FieldType {
  TEXT = 'TEXT',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  CHECKBOX = 'CHECKBOX',
  RADIO = 'RADIO',
  SELECT = 'SELECT',
  TEXTAREA = 'TEXTAREA',
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

export interface ExtractedField {
  id: string;
  label: string;
  type: FieldType;
  page: number;
  boundingBox: BoundingBox;
  required?: boolean;
  confidence: number;
  options?: string[]; // For SELECT, RADIO, CHECKBOX
  placeholder?: string;
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'required' | 'email' | 'phone';
  value?: any;
  message?: string;
}

export interface PageStructure {
  pageNumber: number;
  width: number;
  height: number;
  fields: ExtractedField[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: string[]; // Field IDs
  page?: number;
}

export interface ExtractedFormStructure {
  title?: string;
  pages: PageStructure[];
  fields: ExtractedField[];
  sections?: FormSection[];
}

export interface DocumentIntelligenceResult {
  jobId: string;
  status: AnalysisStatus;
  createdAt: string;
  completedAt?: string;
  formStructure: ExtractedFormStructure;
  overallConfidence?: number;
  fieldConfidences?: Record<string, number>;
  errorMessage?: string;
}

export interface AnalysisProgress {
  status: AnalysisStatus;
  progress: number; // 0-100
  message?: string;
  currentStep?: string;
}
