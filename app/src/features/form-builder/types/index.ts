export enum FieldType {
  // Basic Fields
  TEXT = 'TEXT',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  TIME = 'TIME',
  TEXTAREA = 'TEXTAREA',
  
  // Selection Fields
  SELECT = 'SELECT',
  RADIO = 'RADIO',
  CHECKBOX = 'CHECKBOX',
  CHECKBOX_GROUP = 'CHECKBOX_GROUP',
  MULTI_SELECT = 'MULTI_SELECT',
  
  // Advanced Fields
  FILE_UPLOAD = 'FILE_UPLOAD',
  RICH_TEXT = 'RICH_TEXT',
  SIGNATURE = 'SIGNATURE',
  RATING = 'RATING',
  TAGS = 'TAGS',
  COLOR_PICKER = 'COLOR_PICKER',
  SLIDER = 'SLIDER',
  DATE_RANGE = 'DATE_RANGE',
  AUTO_COMPLETE = 'AUTO_COMPLETE',
  
  // Layout
  SECTION = 'SECTION',
  COLUMNS = 'COLUMNS',
  DIVIDER = 'DIVIDER',
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'phone' | 'min' | 'max' | 'custom';
  value?: any;
  message?: string;
}

export interface ConditionalRule {
  show: boolean;
  when: string; // field ID
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

export interface FieldOption {
  label: string;
  value: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  
  // Validation
  validations: ValidationRule[];
  
  // Conditional Logic
  conditional?: ConditionalRule;
  
  // Layout
  width: 'full' | 'half' | 'third' | 'quarter';
  
  // Type-specific properties
  options?: FieldOption[]; // For SELECT, RADIO, CHECKBOX_GROUP
  multiple?: boolean; // For FILE_UPLOAD, MULTI_SELECT
  accept?: string; // For FILE_UPLOAD
  maxFileSize?: number; // For FILE_UPLOAD
  min?: number; // For NUMBER, SLIDER
  max?: number; // For NUMBER, SLIDER
  step?: number; // For NUMBER, SLIDER
  maxStars?: number; // For RATING
  
  // Position
  position: {
    sectionId: string;
    order: number;
  };
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  collapsible: boolean;
  collapsed: boolean;
  columns: number; // 1, 2, or 3
  order: number;
}

export interface FormSchema {
  id: string;
  name: string;
  description: string;
  sections: FormSection[];
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
}

export interface FormBuilderState {
  // Current form being edited
  currentForm: FormSchema | null;
  
  // UI State
  selectedFieldId: string | null;
  draggedFieldType: FieldType | null;
  isPreviewMode: boolean;
  
  // History for undo/redo
  history: FormSchema[];
  historyIndex: number;
  
  // Loading & errors
  isLoading: boolean;
  error: string | null;
}

export interface PaletteItem {
  type: FieldType;
  label: string;
  icon: string;
  category: 'basic' | 'selection' | 'advanced' | 'layout';
  description: string;
}
