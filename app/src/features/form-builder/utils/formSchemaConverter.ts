import { FormSchema, FormField, FieldType as BuilderFieldType, ValidationRule } from '@/features/form-builder/types';
import { ExtractedFormStructure, ExtractedField, FieldType as GenFieldType } from '@/features/document-intelligence/types';

/**
 * Convert form builder schema to extracted form structure for code generation
 */
export const convertFormSchemaToExtractedStructure = (
  schema: FormSchema
): ExtractedFormStructure => {
  const fields = schema.fields.map(convertFieldToExtractedField);
  
  return {
    title: schema.name,
    fields,
    sections: [], // Simplified for now
    pages: [
      {
        pageNumber: 1,
        width: 612,
        height: 792,
        fields,
      },
    ],
  };
};

/**
 * Convert builder field to extracted field
 */
const convertFieldToExtractedField = (field: FormField): ExtractedField => {
  const extractedField: ExtractedField = {
    id: field.id,
    label: field.label,
    type: mapFieldType(field.type),
    page: 1,
    boundingBox: {
      page: 1,
      x: 0,
      y: field.position.order * 50,
      width: 200,
      height: 40,
    },
    required: field.required,
    confidence: 1.0,
  };

  // Add placeholder
  if (field.placeholder) {
    extractedField.placeholder = field.placeholder;
  }

  // Add options for selection fields
  if (field.options && field.options.length > 0) {
    extractedField.options = field.options.map(opt => opt.value);
  }

  // Add validation rules
  if (field.validations && field.validations.length > 0) {
    extractedField.validationRules = field.validations.map(convertValidationRule);
  }

  // Add number constraints
  if (field.min !== undefined) {
    if (!extractedField.validationRules) extractedField.validationRules = [];
    extractedField.validationRules.push({
      type: 'min',
      value: field.min,
      message: `Must be at least ${field.min}`,
    });
  }

  if (field.max !== undefined) {
    if (!extractedField.validationRules) extractedField.validationRules = [];
    extractedField.validationRules.push({
      type: 'max',
      value: field.max,
      message: `Must not exceed ${field.max}`,
    });
  }

  return extractedField;
};

/**
 * Map builder field type to generator field type
 */
const mapFieldType = (builderType: BuilderFieldType): GenFieldType => {
  // Most types map directly
  const typeMap: Record<string, GenFieldType> = {
    TEXT: GenFieldType.TEXT,
    EMAIL: GenFieldType.EMAIL,
    PHONE: GenFieldType.PHONE,
    NUMBER: GenFieldType.NUMBER,
    DATE: GenFieldType.DATE,
    TIME: GenFieldType.TEXT, // Map time to text with validation
    TEXTAREA: GenFieldType.TEXTAREA,
    SELECT: GenFieldType.SELECT,
    RADIO: GenFieldType.RADIO,
    CHECKBOX: GenFieldType.CHECKBOX,
    CHECKBOX_GROUP: GenFieldType.CHECKBOX,
    MULTI_SELECT: GenFieldType.SELECT,
    FILE_UPLOAD: GenFieldType.TEXT, // Will generate special handling
    RICH_TEXT: GenFieldType.TEXTAREA,
    SIGNATURE: GenFieldType.TEXT, // Will generate as base64 string
    RATING: GenFieldType.NUMBER,
    TAGS: GenFieldType.TEXT, // Will generate as JSON string
    COLOR_PICKER: GenFieldType.TEXT,
    SLIDER: GenFieldType.NUMBER,
    DATE_RANGE: GenFieldType.TEXT, // Will generate as two date fields
    AUTO_COMPLETE: GenFieldType.TEXT,
  };

  return typeMap[builderType] || GenFieldType.TEXT;
};

/**
 * Convert validation rule
 */
const convertValidationRule = (rule: ValidationRule): any => {
  return {
    type: rule.type,
    value: rule.value,
    message: rule.message || '',
  };
};

/**
 * Generate field name from label (camelCase, no spaces)
 */
export const generateFieldName = (label: string): string => {
  return label
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
};
