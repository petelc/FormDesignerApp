# Form Designer - PDF Intelligence & Code Generation Features

## 1. Overview

This document details the high-priority features for PDF form processing, document intelligence extraction, and automated code generation. These features leverage Azure Document Intelligence and a custom template engine to transform PDF forms into production-ready React components and backend code.

---

## 2. Feature Architecture

### 2.1 High-Level Flow

```
User Uploads PDF → Document Intelligence Analysis → Review/Edit Structure → 
Select Template → Generate Code → Download/Deploy
```

### 2.2 Component Modules

1. **PDF Upload Module**: Handle file uploads, validation, and preprocessing
2. **Document Intelligence Module**: Integration with Azure Document Intelligence
3. **Structure Review Module**: Review and edit extracted form structure
4. **Code Generation Module**: Generate code using template engine
5. **Project Management Module**: Manage form projects and artifacts

---

## 3. Data Models

### 3.1 Project Model

```typescript
interface FormProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  
  // PDF Information
  originalPdfUrl?: string;
  originalPdfFileName?: string;
  originalPdfSize?: number;
  
  // Document Intelligence Results
  documentIntelligenceJobId?: string;
  documentIntelligenceStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  documentIntelligenceResult?: DocumentIntelligenceResult;
  
  // Form Definition (extracted or built)
  formDefinition?: FormDefinition;
  
  // Code Generation
  codeGenerationJobId?: string;
  codeGenerationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  generatedCode?: GeneratedCodeArtifacts;
  selectedTemplate?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastProcessedAt?: string;
}

enum ProjectStatus {
  DRAFT = 'draft',
  PDF_UPLOADED = 'pdf_uploaded',
  ANALYZING = 'analyzing',
  ANALYSIS_COMPLETE = 'analysis_complete',
  STRUCTURE_REVIEWED = 'structure_reviewed',
  GENERATING_CODE = 'generating_code',
  CODE_GENERATED = 'code_generated',
  DEPLOYED = 'deployed',
  ERROR = 'error'
}
```

### 3.2 Document Intelligence Result

```typescript
interface DocumentIntelligenceResult {
  jobId: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  
  // Extracted structure
  formStructure: ExtractedFormStructure;
  
  // Raw analysis data
  rawResponse?: any;
  
  // Confidence scores
  overallConfidence?: number;
  fieldConfidences?: Record<string, number>;
}

interface ExtractedFormStructure {
  title?: string;
  pages: PageStructure[];
  fields: ExtractedField[];
  tables?: ExtractedTable[];
  sections?: FormSection[];
}

interface PageStructure {
  pageNumber: number;
  width: number;
  height: number;
  elements: PageElement[];
}

interface PageElement {
  id: string;
  type: 'text' | 'field' | 'checkbox' | 'table' | 'image';
  boundingBox: BoundingBox;
  content?: string;
  confidence?: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ExtractedField {
  id: string;
  label: string;
  type: FieldType;
  
  // Position information
  page: number;
  boundingBox: BoundingBox;
  
  // Field properties
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  
  // Validation hints from PDF
  format?: string; // e.g., "email", "phone", "date"
  maxLength?: number;
  
  // Extraction metadata
  confidence: number;
  extractionMethod: 'ocr' | 'form_recognizer' | 'layout';
}

enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  NUMBER = 'number',
  DATE = 'date',
  DATETIME = 'datetime',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  SIGNATURE = 'signature',
  FILE = 'file'
}

interface ExtractedTable {
  id: string;
  page: number;
  boundingBox: BoundingBox;
  rows: number;
  columns: number;
  headers?: string[];
  data?: string[][];
  confidence: number;
}

interface FormSection {
  id: string;
  title?: string;
  description?: string;
  fields: string[]; // Field IDs
  order: number;
}
```

### 3.3 Form Definition

```typescript
interface FormDefinition {
  id: string;
  title: string;
  description: string;
  version: number;
  
  // Fields can be from extracted data or manually added
  fields: FormField[];
  
  // Layout and organization
  sections?: FormSection[];
  layout?: FormLayout;
  
  // Validation rules
  validationRules?: ValidationRule[];
  
  // Styling preferences
  stylePreferences?: StylePreferences;
  
  // Metadata
  source: 'pdf_extraction' | 'manual_builder' | 'hybrid';
  extractedFrom?: string; // PDF file name
}

interface FormField {
  id: string;
  type: FieldType;
  label: string;
  name: string; // Field name for form submission
  
  // UI Properties
  placeholder?: string;
  helpText?: string;
  
  // Validation
  required: boolean;
  validation?: FieldValidation;
  
  // Options (for select, radio, checkbox)
  options?: FieldOption[];
  
  // Layout
  order: number;
  section?: string;
  width?: 'full' | 'half' | 'third' | 'quarter';
  
  // Conditional logic
  conditionalLogic?: ConditionalLogic;
  
  // Metadata
  extractedFromPdf?: boolean;
  extractedFieldId?: string;
  confidence?: number;
}

interface FormLayout {
  type: 'single-column' | 'two-column' | 'grid' | 'custom';
  gridColumns?: number;
  spacing?: 'compact' | 'normal' | 'relaxed';
}

interface ValidationRule {
  fieldId: string;
  rule: string;
  message: string;
  customValidator?: string;
}

interface StylePreferences {
  theme?: 'default' | 'material' | 'bootstrap' | 'custom';
  primaryColor?: string;
  fontSize?: 'small' | 'medium' | 'large';
  spacing?: 'compact' | 'normal' | 'relaxed';
}
```

### 3.4 Code Generation Models

```typescript
interface CodeGenerationRequest {
  projectId: string;
  formDefinition: FormDefinition;
  template: string; // Template identifier
  options?: CodeGenerationOptions;
}

interface CodeGenerationOptions {
  // Framework preferences
  framework?: 'react' | 'vue' | 'angular';
  styling?: 'css' | 'scss' | 'styled-components' | 'tailwind';
  
  // Backend preferences
  backendFramework?: 'express' | 'nestjs' | 'aspnet';
  database?: 'postgresql' | 'mongodb' | 'mysql';
  orm?: 'prisma' | 'typeorm' | 'entity-framework';
  
  // Features to include
  includeValidation?: boolean;
  includeApi?: boolean;
  includeTests?: boolean;
  includeDocumentation?: boolean;
  
  // Code style
  typescript?: boolean;
  prettier?: boolean;
  eslint?: boolean;
}

interface GeneratedCodeArtifacts {
  jobId: string;
  status: 'completed';
  generatedAt: string;
  
  // Frontend artifacts
  frontend: {
    component: GeneratedFile; // React component
    types?: GeneratedFile; // TypeScript types
    styles?: GeneratedFile; // CSS/SCSS
    tests?: GeneratedFile; // Unit tests
    validationSchema?: GeneratedFile; // Yup/Zod schema
  };
  
  // Backend artifacts
  backend?: {
    controller?: GeneratedFile;
    service?: GeneratedFile;
    repository?: GeneratedFile;
    dto?: GeneratedFile;
    entity?: GeneratedFile;
    migration?: GeneratedFile;
    tests?: GeneratedFile;
  };
  
  // Documentation
  documentation?: {
    readme: GeneratedFile;
    apiDocs?: GeneratedFile;
    componentDocs?: GeneratedFile;
  };
  
  // Package files
  packageJson?: GeneratedFile;
  
  // Download options
  downloadUrl?: string; // URL to download zip
  expiresAt?: string; // Download link expiration
}

interface GeneratedFile {
  filename: string;
  path: string;
  content: string;
  language: 'typescript' | 'javascript' | 'css' | 'scss' | 'html' | 'markdown' | 'json';
  size: number;
}

interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  framework: string;
  version: string;
  tags: string[];
  
  // Template capabilities
  supportsValidation: boolean;
  supportsConditionalLogic: boolean;
  supportsFileUpload: boolean;
  supportsMultiStep: boolean;
  
  // Preview
  previewImageUrl?: string;
  exampleUrl?: string;
}
```

---

## 4. API Endpoints

### 4.1 Projects Management

#### Create Project
```typescript
POST /api/projects
Request Body: {
  name: string;
  description?: string;
}
Response: FormProject
```

#### Get Projects List
```typescript
GET /api/projects?page=1&pageSize=10&status=draft
Response: PaginatedResponse<FormProject>
```

#### Get Project by ID
```typescript
GET /api/projects/{id}
Response: FormProject
```

#### Update Project
```typescript
PUT /api/projects/{id}
Request Body: Partial<FormProject>
Response: FormProject
```

#### Delete Project
```typescript
DELETE /api/projects/{id}
Response: { success: boolean }
```

---

### 4.2 PDF Upload & Processing

#### Upload PDF
```typescript
POST /api/projects/{projectId}/upload-pdf
Content-Type: multipart/form-data
Request Body: {
  file: File; // PDF file
  options?: {
    extractImmediately?: boolean;
  }
}
Response: {
  projectId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  documentIntelligenceJobId?: string; // If extractImmediately=true
}
```

#### Start Document Intelligence Analysis
```typescript
POST /api/projects/{projectId}/analyze
Response: {
  jobId: string;
  status: 'pending' | 'processing';
  estimatedCompletionTime?: string;
}
```

#### Get Analysis Status
```typescript
GET /api/projects/{projectId}/analysis-status
Response: {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  result?: DocumentIntelligenceResult;
  error?: string;
}
```

#### Get Document Intelligence Result
```typescript
GET /api/projects/{projectId}/analysis-result
Response: DocumentIntelligenceResult
```

---

### 4.3 Form Structure Management

#### Get Extracted Structure
```typescript
GET /api/projects/{projectId}/form-structure
Response: ExtractedFormStructure
```

#### Update Form Structure (Review/Edit)
```typescript
PUT /api/projects/{projectId}/form-structure
Request Body: ExtractedFormStructure
Response: ExtractedFormStructure
```

#### Convert to Form Definition
```typescript
POST /api/projects/{projectId}/convert-to-form
Request Body: {
  structure: ExtractedFormStructure;
  options?: {
    autoDetectValidation?: boolean;
    groupBySections?: boolean;
    inferFieldTypes?: boolean;
  }
}
Response: FormDefinition
```

#### Update Form Definition
```typescript
PUT /api/projects/{projectId}/form-definition
Request Body: FormDefinition
Response: FormDefinition
```

---

### 4.4 Code Generation

#### Get Available Templates
```typescript
GET /api/code-generation/templates
Response: CodeTemplate[]
```

#### Get Template Details
```typescript
GET /api/code-generation/templates/{templateId}
Response: CodeTemplate
```

#### Generate Code
```typescript
POST /api/projects/{projectId}/generate-code
Request Body: {
  templateId: string;
  options?: CodeGenerationOptions;
}
Response: {
  jobId: string;
  status: 'pending' | 'processing';
  estimatedCompletionTime?: string;
}
```

#### Get Code Generation Status
```typescript
GET /api/projects/{projectId}/generation-status
Response: {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  result?: GeneratedCodeArtifacts;
  error?: string;
}
```

#### Get Generated Code
```typescript
GET /api/projects/{projectId}/generated-code
Response: GeneratedCodeArtifacts
```

#### Download Generated Code
```typescript
GET /api/projects/{projectId}/download
Response: Blob (ZIP file)
```

#### Get Specific Generated File
```typescript
GET /api/projects/{projectId}/generated-code/files/{filename}
Response: {
  filename: string;
  content: string;
  language: string;
}
```

---

## 5. Redux State Management

### 5.1 Projects Slice

```typescript
interface ProjectsState {
  items: FormProject[];
  currentProject: FormProject | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationState;
  
  // Upload state
  uploadProgress: number;
  isUploading: boolean;
  uploadError: string | null;
}

// Async thunks
export const fetchProjects = createAsyncThunk(...);
export const fetchProjectById = createAsyncThunk(...);
export const createProject = createAsyncThunk(...);
export const updateProject = createAsyncThunk(...);
export const deleteProject = createAsyncThunk(...);
export const uploadPdf = createAsyncThunk(...);
```

### 5.2 Document Intelligence Slice

```typescript
interface DocumentIntelligenceState {
  currentAnalysis: DocumentIntelligenceResult | null;
  analysisStatus: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  analysisProgress: number;
  isLoading: boolean;
  error: string | null;
}

// Async thunks
export const startAnalysis = createAsyncThunk(...);
export const pollAnalysisStatus = createAsyncThunk(...);
export const fetchAnalysisResult = createAsyncThunk(...);
```

### 5.3 Form Structure Slice

```typescript
interface FormStructureState {
  extractedStructure: ExtractedFormStructure | null;
  formDefinition: FormDefinition | null;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  error: string | null;
}

// Async thunks
export const fetchFormStructure = createAsyncThunk(...);
export const updateFormStructure = createAsyncThunk(...);
export const convertToFormDefinition = createAsyncThunk(...);
export const updateFormDefinition = createAsyncThunk(...);
```

### 5.4 Code Generation Slice

```typescript
interface CodeGenerationState {
  templates: CodeTemplate[];
  selectedTemplate: CodeTemplate | null;
  generatedCode: GeneratedCodeArtifacts | null;
  generationStatus: 'idle' | 'pending' | 'processing' | 'completed' | 'failed';
  generationProgress: number;
  isLoading: boolean;
  error: string | null;
}

// Async thunks
export const fetchTemplates = createAsyncThunk(...);
export const fetchTemplateById = createAsyncThunk(...);
export const generateCode = createAsyncThunk(...);
export const pollGenerationStatus = createAsyncThunk(...);
export const fetchGeneratedCode = createAsyncThunk(...);
export const downloadCode = createAsyncThunk(...);
```

---

## 6. Key UI Components

### 6.1 Project Dashboard
- List of projects with status
- Quick actions (upload PDF, create new, view code)
- Filter by status, date
- Search functionality

### 6.2 PDF Upload Component
```typescript
interface PDFUploadProps {
  projectId?: string; // If uploading to existing project
  onUploadComplete: (result: UploadResult) => void;
  onUploadError: (error: Error) => void;
}

// Features:
// - Drag & drop zone
// - File validation (PDF only, max size)
// - Upload progress bar
// - Preview of uploaded PDF
// - Option to start analysis immediately
```

### 6.3 Document Intelligence Viewer
```typescript
interface DocumentIntelligenceViewerProps {
  analysisResult: DocumentIntelligenceResult;
  pdfUrl: string;
  onFieldClick: (field: ExtractedField) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<ExtractedField>) => void;
}

// Features:
// - Side-by-side PDF and extracted fields
// - Highlight fields on PDF
// - Edit field properties
// - Accept/reject extracted fields
// - Confidence score indicators
```

### 6.4 Form Structure Editor
```typescript
interface FormStructureEditorProps {
  structure: ExtractedFormStructure;
  onChange: (structure: ExtractedFormStructure) => void;
  mode: 'view' | 'edit';
}

// Features:
// - Tree view of form structure
// - Drag & drop to reorder fields
// - Add/remove fields
// - Edit field properties
// - Group fields into sections
// - Set validation rules
```

### 6.5 Code Generation Wizard
```typescript
interface CodeGenerationWizardProps {
  projectId: string;
  formDefinition: FormDefinition;
  onComplete: (artifacts: GeneratedCodeArtifacts) => void;
}

// Steps:
// 1. Select template
// 2. Configure options (framework, styling, features)
// 3. Review form definition
// 4. Generate (with progress)
// 5. View/download code
```

### 6.6 Code Viewer
```typescript
interface CodeViewerProps {
  artifacts: GeneratedCodeArtifacts;
  activeFile?: string;
  onFileSelect: (filename: string) => void;
  onDownload: () => void;
}

// Features:
// - File tree navigation
// - Syntax highlighted code display
// - Copy to clipboard
// - Download individual files
// - Download full project as ZIP
// - Search within code
```

---

## 7. User Workflows

### 7.1 PDF Upload to Code Generation Flow

```
1. Create New Project
   ↓
2. Upload PDF
   ↓
3. Start Document Intelligence Analysis
   ↓ (polling for status)
4. View Extracted Structure
   ↓
5. Review & Edit Fields
   ↓
6. Convert to Form Definition
   ↓
7. Select Code Template
   ↓
8. Configure Generation Options
   ↓
9. Generate Code
   ↓ (polling for status)
10. View Generated Code
    ↓
11. Download Code Package
```

### 7.2 Manual Form Builder Flow (Phase 2)

```
1. Create New Project
   ↓
2. Open Form Builder
   ↓
3. Design Form (drag & drop)
   ↓
4. Configure Fields & Validation
   ↓
5. Preview Form
   ↓
6. Select Code Template
   ↓
7. Generate Code
   ↓
8. Download Code Package
```

### 7.3 Hybrid Flow

```
1. Create New Project
   ↓
2. Upload PDF
   ↓
3. Extract Structure
   ↓
4. Open in Form Builder
   ↓
5. Enhance with Additional Fields
   ↓
6. Generate Code
```

---

## 8. Polling Strategy

For long-running operations (document intelligence, code generation), implement polling:

```typescript
// Custom hook for polling
export const usePolling = (
  pollFn: () => Promise<any>,
  interval: number = 2000,
  maxAttempts: number = 60
) => {
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  useEffect(() => {
    if (!isPolling) return;
    
    const poll = async () => {
      try {
        const result = await pollFn();
        
        if (result.status === 'completed' || result.status === 'failed') {
          setIsPolling(false);
          return;
        }
        
        if (attempts >= maxAttempts) {
          setIsPolling(false);
          throw new Error('Polling timeout');
        }
        
        setAttempts(prev => prev + 1);
      } catch (error) {
        setIsPolling(false);
        throw error;
      }
    };
    
    const timer = setInterval(poll, interval);
    return () => clearInterval(timer);
  }, [isPolling, attempts, pollFn, interval, maxAttempts]);
  
  return { isPolling, startPolling: () => setIsPolling(true) };
};

// Usage in component
const { isPolling, startPolling } = usePolling(
  () => dispatch(pollAnalysisStatus(projectId)),
  2000,
  60
);
```

---

## 9. File Upload Implementation

```typescript
// components/PDFUpload.tsx
export const PDFUpload: React.FC<PDFUploadProps> = ({ projectId, onUploadComplete }) => {
  const dispatch = useAppDispatch();
  const [file, setFile] = useState<File | null>(null);
  const uploadProgress = useAppSelector(state => state.projects.uploadProgress);
  
  const handleUpload = async () => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('options', JSON.stringify({ extractImmediately: true }));
    
    try {
      const result = await dispatch(uploadPdf({ projectId, formData })).unwrap();
      onUploadComplete(result);
    } catch (error) {
      // Handle error
    }
  };
  
  // Drag & drop handlers, file validation, etc.
  return (
    <div className="pdf-upload">
      <DropZone onDrop={setFile} accept=".pdf" />
      {file && (
        <>
          <FilePreview file={file} />
          <Button onClick={handleUpload} disabled={uploadProgress > 0}>
            Upload & Analyze
          </Button>
          {uploadProgress > 0 && <ProgressBar now={uploadProgress} />}
        </>
      )}
    </div>
  );
};
```

---

## 10. WebSocket for Real-time Updates (Optional Enhancement)

For better UX, consider WebSocket connections for real-time updates:

```typescript
// WebSocket events
interface AnalysisProgressEvent {
  type: 'analysis.progress';
  projectId: string;
  progress: number;
  message: string;
}

interface AnalysisCompleteEvent {
  type: 'analysis.complete';
  projectId: string;
  result: DocumentIntelligenceResult;
}

interface GenerationProgressEvent {
  type: 'generation.progress';
  projectId: string;
  progress: number;
  currentFile: string;
}

interface GenerationCompleteEvent {
  type: 'generation.complete';
  projectId: string;
  artifacts: GeneratedCodeArtifacts;
}

// WebSocket connection
const ws = new WebSocket(`wss://api.formdesigner.com/ws?token=${token}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'analysis.progress':
      dispatch(updateAnalysisProgress(data));
      break;
    case 'analysis.complete':
      dispatch(setAnalysisResult(data.result));
      break;
    // ... handle other events
  }
};
```

---

## 11. Error Handling

### 11.1 PDF Upload Errors
- File too large (> 10MB)
- Invalid file type (not PDF)
- Corrupted PDF
- Network errors

### 11.2 Document Intelligence Errors
- Analysis timeout
- Unsupported PDF format
- No extractable content
- API quota exceeded

### 11.3 Code Generation Errors
- Invalid form definition
- Template not found
- Generation timeout
- Missing required fields

### 11.4 Error Display
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// User-friendly error messages
const ERROR_MESSAGES = {
  'pdf_too_large': 'PDF file is too large. Maximum size is 10MB.',
  'invalid_pdf': 'The uploaded file is not a valid PDF.',
  'analysis_timeout': 'Document analysis is taking longer than expected. Please try again.',
  'no_content': 'No extractable content found in the PDF.',
  'generation_failed': 'Code generation failed. Please check the form definition and try again.',
};
```

---

## 12. Performance Considerations

### 12.1 Large PDF Handling
- Stream processing for large files
- Chunked upload for files > 5MB
- Background processing
- Progress indicators

### 12.2 Code Generation Optimization
- Cache generated code for 24 hours
- Incremental generation (frontend first, then backend)
- Lazy loading of generated files in viewer

### 12.3 UI Performance
- Virtual scrolling for large field lists
- Lazy loading of PDF pages in viewer
- Debounced form structure updates

---

## 13. Testing Strategy

### 13.1 PDF Upload Tests
- Valid PDF upload
- Invalid file type rejection
- File size validation
- Upload cancellation
- Network failure handling

### 13.2 Document Intelligence Tests
- Mock analysis results
- Polling mechanism
- Timeout handling
- Result parsing

### 13.3 Code Generation Tests
- Template selection
- Options configuration
- Code generation
- File download
- Code quality validation

---

## 14. Security Considerations

### 14.1 File Upload Security
- Validate file type (magic numbers, not just extension)
- Scan for malware
- Limit file size
- Store in secure blob storage
- Generate signed URLs with expiration

### 14.2 Generated Code Security
- Sanitize form field names
- Validate generated code syntax
- Include security best practices in templates
- Expire download links after 24 hours

---

This specification provides a comprehensive foundation for implementing the PDF intelligence and code generation features. The focus is on creating a smooth, intuitive workflow from PDF upload to generated code download.
