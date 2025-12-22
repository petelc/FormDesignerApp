import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FormBuilderState, FormSchema, FormField, FormSection, FieldType } from '../types';
import { v4 as uuidv4 } from 'uuid';

const initialState: FormBuilderState = {
  currentForm: null,
  selectedFieldId: null,
  draggedFieldType: null,
  isPreviewMode: false,
  history: [],
  historyIndex: -1,
  isLoading: false,
  error: null,
};

const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    // Form actions
    createNewForm: (state, action: PayloadAction<{ name: string; description: string }>) => {
      const newForm: FormSchema = {
        id: uuidv4(),
        name: action.payload.name,
        description: action.payload.description,
        sections: [{
          id: 'default-section',
          title: 'Form Fields',
          description: '',
          collapsible: false,
          collapsed: false,
          columns: 1,
          order: 0,
        }],
        fields: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      state.currentForm = newForm;
      state.history = [newForm];
      state.historyIndex = 0;
    },
    
    loadForm: (state, action: PayloadAction<FormSchema>) => {
      state.currentForm = action.payload;
      state.history = [action.payload];
      state.historyIndex = 0;
    },
    
    updateFormInfo: (state, action: PayloadAction<{ name?: string; description?: string }>) => {
      if (state.currentForm) {
        if (action.payload.name) state.currentForm.name = action.payload.name;
        if (action.payload.description) state.currentForm.description = action.payload.description;
        state.currentForm.updatedAt = new Date().toISOString();
        
        // Add to history
        addToHistory(state);
      }
    },
    
    // Field actions
    addField: (state, action: PayloadAction<{ fieldType: FieldType; sectionId: string; position?: number }>) => {
      if (!state.currentForm) return;
      
      const { fieldType, sectionId, position } = action.payload;
      const section = state.currentForm.sections.find(s => s.id === sectionId);
      if (!section) return;
      
      const fieldsInSection = state.currentForm.fields.filter(f => f.position.sectionId === sectionId);
      const order = position !== undefined ? position : fieldsInSection.length;
      
      const newField: FormField = {
        id: uuidv4(),
        type: fieldType,
        label: getDefaultLabel(fieldType),
        placeholder: getDefaultPlaceholder(fieldType),
        required: false,
        disabled: false,
        readonly: false,
        validations: [],
        width: 'full',
        position: {
          sectionId,
          order,
        },
      };
      
      // Add type-specific defaults
      if (fieldType === FieldType.SELECT || fieldType === FieldType.RADIO || fieldType === FieldType.CHECKBOX_GROUP) {
        newField.options = [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ];
      }
      
      if (fieldType === FieldType.RATING) {
        newField.maxStars = 5;
        newField.defaultValue = 0;
      }
      
      if (fieldType === FieldType.SLIDER) {
        newField.min = 0;
        newField.max = 100;
        newField.step = 1;
        newField.defaultValue = 50;
      }
      
      if (fieldType === FieldType.FILE_UPLOAD) {
        newField.accept = '*/*';
        newField.maxFileSize = 5 * 1024 * 1024; // 5MB
        newField.multiple = false;
      }
      
      state.currentForm.fields.push(newField);
      state.currentForm.updatedAt = new Date().toISOString();
      state.selectedFieldId = newField.id;
      
      // Add to history
      addToHistory(state);
    },
    
    updateField: (state, action: PayloadAction<{ fieldId: string; updates: Partial<FormField> }>) => {
      if (!state.currentForm) return;
      
      const field = state.currentForm.fields.find(f => f.id === action.payload.fieldId);
      if (field) {
        Object.assign(field, action.payload.updates);
        state.currentForm.updatedAt = new Date().toISOString();
        
        // Add to history
        addToHistory(state);
      }
    },
    
    deleteField: (state, action: PayloadAction<string>) => {
      if (!state.currentForm) return;
      
      state.currentForm.fields = state.currentForm.fields.filter(f => f.id !== action.payload);
      if (state.selectedFieldId === action.payload) {
        state.selectedFieldId = null;
      }
      state.currentForm.updatedAt = new Date().toISOString();
      
      // Add to history
      addToHistory(state);
    },
    
    duplicateField: (state, action: PayloadAction<string>) => {
      if (!state.currentForm) return;
      
      const field = state.currentForm.fields.find(f => f.id === action.payload);
      if (field) {
        const newField: FormField = {
          ...field,
          id: uuidv4(),
          label: `${field.label} (Copy)`,
          position: {
            ...field.position,
            order: field.position.order + 1,
          },
        };
        
        state.currentForm.fields.push(newField);
        state.currentForm.updatedAt = new Date().toISOString();
        state.selectedFieldId = newField.id;
        
        // Add to history
        addToHistory(state);
      }
    },
    
    reorderField: (state, action: PayloadAction<{ fieldId: string; newPosition: number; newSectionId?: string }>) => {
      if (!state.currentForm) return;
      
      const field = state.currentForm.fields.find(f => f.id === action.payload.fieldId);
      if (field) {
        const oldSectionId = field.position.sectionId;
        const newSectionId = action.payload.newSectionId || oldSectionId;
        
        // Update field position
        field.position.sectionId = newSectionId;
        field.position.order = action.payload.newPosition;
        
        // Reorder other fields in the section
        const fieldsInSection = state.currentForm.fields
          .filter(f => f.position.sectionId === newSectionId && f.id !== field.id)
          .sort((a, b) => a.position.order - b.position.order);
        
        fieldsInSection.forEach((f, index) => {
          f.position.order = index >= action.payload.newPosition ? index + 1 : index;
        });
        
        state.currentForm.updatedAt = new Date().toISOString();
        
        // Add to history
        addToHistory(state);
      }
    },
    
    // Section actions
    addSection: (state) => {
      if (!state.currentForm) return;
      
      const newSection: FormSection = {
        id: uuidv4(),
        title: `Section ${state.currentForm.sections.length + 1}`,
        description: '',
        collapsible: false,
        collapsed: false,
        columns: 1,
        order: state.currentForm.sections.length,
      };
      
      state.currentForm.sections.push(newSection);
      state.currentForm.updatedAt = new Date().toISOString();
      
      // Add to history
      addToHistory(state);
    },
    
    updateSection: (state, action: PayloadAction<{ sectionId: string; updates: Partial<FormSection> }>) => {
      if (!state.currentForm) return;
      
      const section = state.currentForm.sections.find(s => s.id === action.payload.sectionId);
      if (section) {
        Object.assign(section, action.payload.updates);
        state.currentForm.updatedAt = new Date().toISOString();
        
        // Add to history
        addToHistory(state);
      }
    },
    
    deleteSection: (state, action: PayloadAction<string>) => {
      if (!state.currentForm) return;
      
      // Move fields to default section
      const defaultSection = state.currentForm.sections[0];
      state.currentForm.fields.forEach(field => {
        if (field.position.sectionId === action.payload) {
          field.position.sectionId = defaultSection.id;
        }
      });
      
      state.currentForm.sections = state.currentForm.sections.filter(s => s.id !== action.payload);
      state.currentForm.updatedAt = new Date().toISOString();
      
      // Add to history
      addToHistory(state);
    },
    
    // UI actions
    selectField: (state, action: PayloadAction<string | null>) => {
      state.selectedFieldId = action.payload;
    },
    
    setDraggedFieldType: (state, action: PayloadAction<FieldType | null>) => {
      state.draggedFieldType = action.payload;
    },
    
    togglePreviewMode: (state) => {
      state.isPreviewMode = !state.isPreviewMode;
    },
    
    // History actions
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        state.currentForm = state.history[state.historyIndex];
      }
    },
    
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        state.currentForm = state.history[state.historyIndex];
      }
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

// Helper function to add to history
const addToHistory = (state: FormBuilderState) => {
  if (!state.currentForm) return;
  
  // Remove any history after current index
  state.history = state.history.slice(0, state.historyIndex + 1);
  
  // Add new state
  state.history.push(JSON.parse(JSON.stringify(state.currentForm)));
  state.historyIndex++;
  
  // Limit history to 50 items
  if (state.history.length > 50) {
    state.history.shift();
    state.historyIndex--;
  }
};

// Helper functions for defaults
const getDefaultLabel = (fieldType: FieldType): string => {
  const labels: Record<FieldType, string> = {
    [FieldType.TEXT]: 'Text Field',
    [FieldType.EMAIL]: 'Email Address',
    [FieldType.PHONE]: 'Phone Number',
    [FieldType.NUMBER]: 'Number',
    [FieldType.DATE]: 'Date',
    [FieldType.TIME]: 'Time',
    [FieldType.TEXTAREA]: 'Text Area',
    [FieldType.SELECT]: 'Select Option',
    [FieldType.RADIO]: 'Radio Group',
    [FieldType.CHECKBOX]: 'Checkbox',
    [FieldType.CHECKBOX_GROUP]: 'Checkbox Group',
    [FieldType.MULTI_SELECT]: 'Multi Select',
    [FieldType.FILE_UPLOAD]: 'File Upload',
    [FieldType.RICH_TEXT]: 'Rich Text',
    [FieldType.SIGNATURE]: 'Signature',
    [FieldType.RATING]: 'Rating',
    [FieldType.TAGS]: 'Tags',
    [FieldType.COLOR_PICKER]: 'Color',
    [FieldType.SLIDER]: 'Slider',
    [FieldType.DATE_RANGE]: 'Date Range',
    [FieldType.AUTO_COMPLETE]: 'Auto Complete',
    [FieldType.SECTION]: 'Section',
    [FieldType.COLUMNS]: 'Columns',
    [FieldType.DIVIDER]: 'Divider',
  };
  return labels[fieldType] || 'Field';
};

const getDefaultPlaceholder = (fieldType: FieldType): string => {
  const placeholders: Record<FieldType, string> = {
    [FieldType.TEXT]: 'Enter text...',
    [FieldType.EMAIL]: 'example@email.com',
    [FieldType.PHONE]: '(555) 555-5555',
    [FieldType.NUMBER]: '0',
    [FieldType.DATE]: 'Select date',
    [FieldType.TIME]: 'Select time',
    [FieldType.TEXTAREA]: 'Enter text...',
    [FieldType.SELECT]: 'Select an option',
    [FieldType.TAGS]: 'Add tags...',
    [FieldType.AUTO_COMPLETE]: 'Start typing...',
    [FieldType.COLOR_PICKER]: '#000000',
    [FieldType.FILE_UPLOAD]: 'Choose file...',
    [FieldType.RICH_TEXT]: 'Enter text...',
    [FieldType.SIGNATURE]: 'Sign here',
    [FieldType.RATING]: '',
    [FieldType.SLIDER]: '',
    [FieldType.DATE_RANGE]: 'Select date range',
    [FieldType.RADIO]: '',
    [FieldType.CHECKBOX]: '',
    [FieldType.CHECKBOX_GROUP]: '',
    [FieldType.MULTI_SELECT]: 'Select options',
    [FieldType.SECTION]: '',
    [FieldType.COLUMNS]: '',
    [FieldType.DIVIDER]: '',
  };
  return placeholders[fieldType] || '';
};

export const {
  createNewForm,
  loadForm,
  updateFormInfo,
  addField,
  updateField,
  deleteField,
  duplicateField,
  reorderField,
  addSection,
  updateSection,
  deleteSection,
  selectField,
  setDraggedFieldType,
  togglePreviewMode,
  undo,
  redo,
  setError,
} = formBuilderSlice.actions;

export default formBuilderSlice.reducer;
