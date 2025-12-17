import {
  ExtractedFormStructure,
  ExtractedField,
  FieldType,
} from '@/features/document-intelligence/types';
import {
  CodeGenerationOptions,
  GeneratedCode,
  GeneratedFile,
  CodeTemplate,
} from '../types';

/**
 * Generate React TypeScript form component code
 */
export const generateReactTypeScriptForm = (
  formStructure: ExtractedFormStructure,
  projectName: string,
  options: CodeGenerationOptions
): string => {
  const componentName = toPascalCase(projectName) + 'Form';
  const useFormik = options.formLibrary === 'formik';
  const useReactHookForm = options.formLibrary === 'react-hook-form';
  
  const imports = generateImports(options);
  const typeInterface = generateTypeInterface(formStructure);
  const validationSchema = generateValidationSchema(formStructure, options.validationLibrary!);
  const fieldComponents = generateFieldComponents(formStructure.fields, options);
  
  return `${imports}

${typeInterface}

${validationSchema}

interface ${componentName}Props {
  onSubmit: (values: FormData) => void;
  initialValues?: Partial<FormData>;
  isLoading?: boolean;
}

const ${componentName}: React.FC<${componentName}Props> = ({
  onSubmit,
  initialValues,
  isLoading = false,
}) => {
  ${useFormik ? generateFormikSetup(formStructure) : ''}
  ${useReactHookForm ? generateReactHookFormSetup() : ''}

  return (
    <form onSubmit={${useFormik ? 'formik.handleSubmit' : 'handleSubmit(onSubmit)'}}>
      ${fieldComponents}

      <button
        type="submit"
        disabled={isLoading}
        className="btn btn-primary"
      >
        {isLoading ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

export default ${componentName};
`;
};

/**
 * Generate imports based on options
 */
const generateImports = (options: CodeGenerationOptions): string => {
  const imports: string[] = ["import React from 'react';"];
  
  if (options.formLibrary === 'formik') {
    imports.push("import { useFormik } from 'formik';");
  } else if (options.formLibrary === 'react-hook-form') {
    imports.push("import { useForm } from 'react-hook-form';");
  }
  
  if (options.validationLibrary === 'YUP') {
    imports.push("import * as Yup from 'yup';");
  } else if (options.validationLibrary === 'ZOD') {
    imports.push("import { z } from 'zod';");
  }
  
  if (options.styling === 'bootstrap') {
    imports.push("import { Form, Button } from 'react-bootstrap';");
  }
  
  return imports.join('\n');
};

/**
 * Generate TypeScript interface for form data
 */
const generateTypeInterface = (formStructure: ExtractedFormStructure): string => {
  const fields = formStructure.fields.map((field) => {
    const tsType = getTypeScriptType(field.type);
    const optional = field.required ? '' : '?';
    return `  ${toCamelCase(field.label)}${optional}: ${tsType};`;
  });
  
  return `interface FormData {
${fields.join('\n')}
}`;
};

/**
 * Generate validation schema
 */
const generateValidationSchema = (
  formStructure: ExtractedFormStructure,
  library: string
): string => {
  if (library === 'YUP') {
    return generateYupSchema(formStructure.fields);
  } else if (library === 'ZOD') {
    return generateZodSchema(formStructure.fields);
  }
  return '';
};

/**
 * Generate Yup validation schema
 */
const generateYupSchema = (fields: ExtractedField[]): string => {
  const schemaFields = fields.map((field) => {
    const fieldName = toCamelCase(field.label);
    let validation = getYupValidation(field);
    return `  ${fieldName}: ${validation},`;
  });
  
  return `const validationSchema = Yup.object({
${schemaFields.join('\n')}
});`;
};

/**
 * Generate Zod validation schema
 */
const generateZodSchema = (fields: ExtractedField[]): string => {
  const schemaFields = fields.map((field) => {
    const fieldName = toCamelCase(field.label);
    let validation = getZodValidation(field);
    return `  ${fieldName}: ${validation},`;
  });
  
  return `const validationSchema = z.object({
${schemaFields.join('\n')}
});`;
};

/**
 * Get Yup validation for a field
 */
const getYupValidation = (field: ExtractedField): string => {
  let validation = '';
  
  switch (field.type) {
    case FieldType.EMAIL:
      validation = "Yup.string().email('Invalid email')";
      break;
    case FieldType.PHONE:
      validation = "Yup.string().matches(/^[0-9]{10}$/, 'Invalid phone')";
      break;
    case FieldType.NUMBER:
      validation = "Yup.number()";
      break;
    case FieldType.DATE:
      validation = "Yup.date()";
      break;
    case FieldType.CHECKBOX:
      validation = "Yup.boolean()";
      break;
    default:
      validation = "Yup.string()";
  }
  
  if (field.required) {
    validation += ".required('This field is required')";
  }
  
  return validation;
};

/**
 * Get Zod validation for a field
 */
const getZodValidation = (field: ExtractedField): string => {
  let validation = '';
  
  switch (field.type) {
    case FieldType.EMAIL:
      validation = "z.string().email('Invalid email')";
      break;
    case FieldType.PHONE:
      validation = "z.string().regex(/^[0-9]{10}$/, 'Invalid phone')";
      break;
    case FieldType.NUMBER:
      validation = "z.number()";
      break;
    case FieldType.DATE:
      validation = "z.date()";
      break;
    case FieldType.CHECKBOX:
      validation = "z.boolean()";
      break;
    default:
      validation = "z.string()";
  }
  
  if (field.required) {
    validation += ".min(1, 'This field is required')";
  } else {
    validation += ".optional()";
  }
  
  return validation;
};

/**
 * Generate field components
 */
const generateFieldComponents = (
  fields: ExtractedField[],
  options: CodeGenerationOptions
): string => {
  return fields.map((field) => generateFieldComponent(field, options)).join('\n\n      ');
};

/**
 * Generate single field component
 */
const generateFieldComponent = (
  field: ExtractedField,
  options: CodeGenerationOptions
): string => {
  const fieldName = toCamelCase(field.label);
  const useFormik = options.formLibrary === 'formik';
  
  if (options.styling === 'bootstrap') {
    return generateBootstrapField(field, fieldName, useFormik);
  }
  
  return generatePlainHTMLField(field, fieldName, useFormik);
};

/**
 * Generate Bootstrap field
 */
const generateBootstrapField = (
  field: ExtractedField,
  fieldName: string,
  useFormik: boolean
): string => {
  const inputType = getHTMLInputType(field.type);
  
  if (field.type === FieldType.TEXTAREA) {
    return `<Form.Group className="mb-3">
        <Form.Label>${field.label}${field.required ? ' *' : ''}</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="${fieldName}"
          ${useFormik ? `value={formik.values.${fieldName}}` : `{...register('${fieldName}')}`}
          ${useFormik ? `onChange={formik.handleChange}` : ''}
          ${useFormik ? `onBlur={formik.handleBlur}` : ''}
          ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
          ${useFormik ? `isInvalid={formik.touched.${fieldName} && !!formik.errors.${fieldName}}` : ''}
        />
        ${useFormik ? `<Form.Control.Feedback type="invalid">
          {formik.errors.${fieldName}}
        </Form.Control.Feedback>` : ''}
      </Form.Group>`;
  }
  
  if (field.type === FieldType.CHECKBOX) {
    return `<Form.Group className="mb-3">
        <Form.Check
          type="checkbox"
          name="${fieldName}"
          label="${field.label}"
          ${useFormik ? `checked={formik.values.${fieldName}}` : `{...register('${fieldName}')}`}
          ${useFormik ? `onChange={formik.handleChange}` : ''}
        />
      </Form.Group>`;
  }
  
  if (field.type === FieldType.SELECT && field.options) {
    return `<Form.Group className="mb-3">
        <Form.Label>${field.label}${field.required ? ' *' : ''}</Form.Label>
        <Form.Select
          name="${fieldName}"
          ${useFormik ? `value={formik.values.${fieldName}}` : `{...register('${fieldName}')}`}
          ${useFormik ? `onChange={formik.handleChange}` : ''}
          ${useFormik ? `isInvalid={formik.touched.${fieldName} && !!formik.errors.${fieldName}}` : ''}
        >
          <option value="">Select...</option>
          ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('\n          ')}
        </Form.Select>
        ${useFormik ? `<Form.Control.Feedback type="invalid">
          {formik.errors.${fieldName}}
        </Form.Control.Feedback>` : ''}
      </Form.Group>`;
  }
  
  return `<Form.Group className="mb-3">
        <Form.Label>${field.label}${field.required ? ' *' : ''}</Form.Label>
        <Form.Control
          type="${inputType}"
          name="${fieldName}"
          ${useFormik ? `value={formik.values.${fieldName}}` : `{...register('${fieldName}')}`}
          ${useFormik ? `onChange={formik.handleChange}` : ''}
          ${useFormik ? `onBlur={formik.handleBlur}` : ''}
          ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
          ${useFormik ? `isInvalid={formik.touched.${fieldName} && !!formik.errors.${fieldName}}` : ''}
        />
        ${useFormik ? `<Form.Control.Feedback type="invalid">
          {formik.errors.${fieldName}}
        </Form.Control.Feedback>` : ''}
      </Form.Group>`;
};

/**
 * Generate plain HTML field
 */
const generatePlainHTMLField = (
  field: ExtractedField,
  fieldName: string,
  useFormik: boolean
): string => {
  const inputType = getHTMLInputType(field.type);
  
  return `<div className="form-group">
        <label htmlFor="${fieldName}">${field.label}${field.required ? ' *' : ''}</label>
        <input
          type="${inputType}"
          id="${fieldName}"
          name="${fieldName}"
          ${useFormik ? `value={formik.values.${fieldName}}` : `{...register('${fieldName}')}`}
          ${useFormik ? `onChange={formik.handleChange}` : ''}
          ${field.placeholder ? `placeholder="${field.placeholder}"` : ''}
        />
        ${useFormik ? `{formik.errors.${fieldName} && <div className="error">{formik.errors.${fieldName}}</div>}` : ''}
      </div>`;
};

/**
 * Generate Formik setup code
 */
const generateFormikSetup = (formStructure: ExtractedFormStructure): string => {
  const initialValues = formStructure.fields.map((field) => {
    const fieldName = toCamelCase(field.label);
    const defaultValue = getDefaultValue(field.type);
    return `    ${fieldName}: initialValues?.${fieldName} ?? ${defaultValue},`;
  });
  
  return `const formik = useFormik<FormData>({
    initialValues: {
${initialValues.join('\n')}
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });`;
};

/**
 * Generate React Hook Form setup code
 */
const generateReactHookFormSetup = (): string => {
  return `const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: initialValues,
  });`;
};

/**
 * Get TypeScript type for field type
 */
const getTypeScriptType = (fieldType: FieldType): string => {
  switch (fieldType) {
    case FieldType.NUMBER:
      return 'number';
    case FieldType.DATE:
      return 'Date | string';
    case FieldType.CHECKBOX:
      return 'boolean';
    case FieldType.SELECT:
    case FieldType.RADIO:
      return 'string';
    default:
      return 'string';
  }
};

/**
 * Get HTML input type for field type
 */
const getHTMLInputType = (fieldType: FieldType): string => {
  switch (fieldType) {
    case FieldType.EMAIL:
      return 'email';
    case FieldType.PHONE:
      return 'tel';
    case FieldType.NUMBER:
      return 'number';
    case FieldType.DATE:
      return 'date';
    case FieldType.CHECKBOX:
      return 'checkbox';
    default:
      return 'text';
  }
};

/**
 * Get default value for field type
 */
const getDefaultValue = (fieldType: FieldType): string => {
  switch (fieldType) {
    case FieldType.NUMBER:
      return '0';
    case FieldType.CHECKBOX:
      return 'false';
    case FieldType.DATE:
      return "''";
    default:
      return "''";
  }
};

/**
 * Convert string to snake_case
 */
const toSnakeCase = (str: string): string => {
  return str
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/_+/g, '_');
};

/**
 * Convert string to PascalCase
 */
const toPascalCase = (str: string): string => {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};

/**
 * Convert string to camelCase
 */
const toCamelCase = (str: string): string => {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
};

/**
 * Main code generator function
 */
export const generateCode = (
  formStructure: ExtractedFormStructure,
  projectName: string,
  options: CodeGenerationOptions
): GeneratedCode => {
  const files: GeneratedFile[] = [];
  
  // Generate frontend form component
  if (options.template === CodeTemplate.REACT_TYPESCRIPT) {
    const formCode = generateReactTypeScriptForm(formStructure, projectName, options);
    files.push({
      path: 'frontend/src/components',
      name: `${toPascalCase(projectName)}Form.tsx`,
      content: formCode,
      language: 'typescript',
    });
  }
  
  // Generate backend code if requested
  if (options.includeBackend && options.backendFramework) {
    const backendFiles = generateBackendCode(formStructure, projectName, options);
    files.push(...backendFiles);
  }
  
  // Generate README
  const readme = generateReadme(projectName, options);
  files.push({
    path: '',
    name: 'README.md',
    content: readme,
    language: 'markdown',
  });
  
  // Generate package.json for frontend
  const frontendPackageJson = generatePackageJson(projectName, options);
  files.push({
    path: 'frontend',
    name: 'package.json',
    content: frontendPackageJson,
    language: 'json',
  });
  
  // Generate package.json for backend if needed
  if (options.includeBackend) {
    const backendPackageJson = generateBackendPackageJson(projectName, options);
    files.push({
      path: 'backend',
      name: 'package.json',
      content: backendPackageJson,
      language: 'json',
    });
  }
  
  return {
    files,
    structure: {
      frontend: files.filter(f => f.path.includes('frontend')).map(f => f.path + '/' + f.name),
      backend: files.filter(f => f.path.includes('backend')).map(f => f.path + '/' + f.name),
      tests: [],
      docs: files.filter(f => f.language === 'markdown').map(f => f.name),
    },
    metadata: {
      template: options.template,
      generatedAt: new Date().toISOString(),
      fileCount: files.length,
    },
  };
};

/**
 * Generate backend code files
 */
const generateBackendCode = (
  formStructure: ExtractedFormStructure,
  projectName: string,
  options: CodeGenerationOptions
): GeneratedFile[] => {
  const files: GeneratedFile[] = [];
  const { generateSQLSchema, generateTypeORMEntity, generateExpressRoutes, generateExpressController, generateBackendValidation } = require('./backendGenerator');
  
  const tableName = toSnakeCase(projectName);
  const entityName = toPascalCase(projectName);
  
  // SQL Schema
  const sqlSchema = generateSQLSchema(formStructure, tableName);
  files.push({
    path: 'backend/sql',
    name: 'schema.sql',
    content: sqlSchema,
    language: 'sql',
  });
  
  // TypeORM Entity
  const entity = generateTypeORMEntity(formStructure, entityName);
  files.push({
    path: 'backend/src/models',
    name: `${toCamelCase(projectName)}.model.ts`,
    content: entity,
    language: 'typescript',
  });
  
  // Express Routes
  const routes = generateExpressRoutes(formStructure, projectName);
  files.push({
    path: 'backend/src/routes',
    name: `${toCamelCase(projectName)}.routes.ts`,
    content: routes,
    language: 'typescript',
  });
  
  // Express Controller
  const controller = generateExpressController(formStructure, projectName);
  files.push({
    path: 'backend/src/controllers',
    name: `${toCamelCase(projectName)}.controller.ts`,
    content: controller,
    language: 'typescript',
  });
  
  // Backend Validation
  const validation = generateBackendValidation(formStructure, projectName);
  files.push({
    path: 'backend/src/validation',
    name: `${toCamelCase(projectName)}.validation.ts`,
    content: validation,
    language: 'typescript',
  });
  
  return files;
};

/**
 * Generate backend package.json
 */
const generateBackendPackageJson = (projectName: string, options: CodeGenerationOptions): string => {
  const dependencies: Record<string, string> = {
    "express": "^4.18.0",
    "express-validator": "^7.0.0",
    "typeorm": "^0.3.0",
    "pg": "^8.11.0",
  };
  
  const devDependencies: Record<string, string> = {
    "@types/express": "^4.17.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0",
    "nodemon": "^3.0.0",
  };
  
  return JSON.stringify({
    name: `${projectName.toLowerCase().replace(/\s+/g, '-')}-api`,
    version: "1.0.0",
    description: `Backend API for ${projectName}`,
    main: "src/index.ts",
    scripts: {
      "dev": "nodemon --exec ts-node src/index.ts",
      "build": "tsc",
      "start": "node dist/index.js",
    },
    dependencies,
    devDependencies,
  }, null, 2);
};

/**
 * Generate README
 */
const generateReadme = (projectName: string, options: CodeGenerationOptions): string => {
  return `# ${toPascalCase(projectName)} Form

Auto-generated form component created by FormDesigner AI.

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`typescript
import ${toPascalCase(projectName)}Form from './components/${toPascalCase(projectName)}Form';

function App() {
  const handleSubmit = (values) => {
    console.log('Form submitted:', values);
  };

  return (
    <${toPascalCase(projectName)}Form onSubmit={handleSubmit} />
  );
}
\`\`\`

## Features

- ✅ TypeScript support
- ✅ Form validation (${options.validationLibrary})
- ✅ ${options.formLibrary === 'formik' ? 'Formik' : 'React Hook Form'} integration
- ✅ ${options.styling === 'bootstrap' ? 'Bootstrap' : 'Custom'} styling
- ✅ Accessible form controls

## Generated Files

${options.includeTests ? '- Form component with tests' : '- Form component'}
${options.includeDocumentation ? '- Full documentation' : ''}
${options.includeBackend ? '- Backend API endpoints' : ''}

---

Generated on ${new Date().toLocaleDateString()}
`;
};

/**
 * Generate package.json
 */
const generatePackageJson = (projectName: string, options: CodeGenerationOptions): string => {
  const dependencies: Record<string, string> = {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
  };
  
  if (options.formLibrary === 'formik') {
    dependencies.formik = "^2.4.0";
  } else if (options.formLibrary === 'react-hook-form') {
    dependencies['react-hook-form'] = "^7.48.0";
  }
  
  if (options.validationLibrary === 'YUP') {
    dependencies.yup = "^1.3.0";
  } else if (options.validationLibrary === 'ZOD') {
    dependencies.zod = "^3.22.0";
  }
  
  if (options.styling === 'bootstrap') {
    dependencies['react-bootstrap'] = "^2.9.0";
    dependencies.bootstrap = "^5.3.0";
  }
  
  return JSON.stringify({
    name: projectName.toLowerCase().replace(/\s+/g, '-'),
    version: "1.0.0",
    description: `Auto-generated form for ${projectName}`,
    dependencies,
    devDependencies: {
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "typescript": "^5.0.0",
    },
  }, null, 2);
};
