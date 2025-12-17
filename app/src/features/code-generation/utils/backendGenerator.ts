import {
  ExtractedFormStructure,
  ExtractedField,
  FieldType,
} from '@/features/document-intelligence/types';

/**
 * Generate SQL schema from form structure
 */
export const generateSQLSchema = (
  formStructure: ExtractedFormStructure,
  tableName: string
): string => {
  const fields = formStructure.fields.map((field) => {
    const columnName = toSnakeCase(field.label);
    const sqlType = getSQLType(field.type);
    const nullable = field.required ? 'NOT NULL' : 'NULL';
    
    return `  ${columnName} ${sqlType} ${nullable}`;
  });

  return `-- Auto-generated SQL schema for ${tableName}
-- Generated on ${new Date().toISOString()}

CREATE TABLE ${tableName} (
  id SERIAL PRIMARY KEY,
${fields.join(',\n')},
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);

-- Indexes
CREATE INDEX idx_${tableName}_created_at ON ${tableName}(created_at);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_${tableName}_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_${tableName}_updated_at
  BEFORE UPDATE ON ${tableName}
  FOR EACH ROW
  EXECUTE FUNCTION update_${tableName}_updated_at();
`;
};

/**
 * Generate TypeORM entity
 */
export const generateTypeORMEntity = (
  formStructure: ExtractedFormStructure,
  entityName: string
): string => {
  const fields = formStructure.fields.map((field) => {
    const fieldName = toCamelCase(field.label);
    const tsType = getTypeScriptType(field.type);
    const decorators = getTypeORMDecorators(field);
    
    return `  ${decorators}
  ${fieldName}${field.required ? '' : '?'}: ${tsType};`;
  });

  return `import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('${toSnakeCase(entityName)}')
export class ${entityName} {
  @PrimaryGeneratedColumn()
  id: number;

${fields.join('\n\n')}

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;
}
`;
};

/**
 * Generate Express.js routes
 */
export const generateExpressRoutes = (
  formStructure: ExtractedFormStructure,
  resourceName: string
): string => {
  const routeName = toKebabCase(resourceName);
  const controllerName = toPascalCase(resourceName);

  return `import express from 'express';
import { ${controllerName}Controller } from '../controllers/${toCamelCase(resourceName)}.controller';
import { validate${controllerName} } from '../validation/${toCamelCase(resourceName)}.validation';

const router = express.Router();
const controller = new ${controllerName}Controller();

/**
 * @route   POST /api/${routeName}
 * @desc    Create new ${resourceName}
 * @access  Private
 */
router.post('/', validate${controllerName}, controller.create);

/**
 * @route   GET /api/${routeName}
 * @desc    Get all ${resourceName}s with pagination
 * @access  Private
 */
router.get('/', controller.getAll);

/**
 * @route   GET /api/${routeName}/:id
 * @desc    Get ${resourceName} by ID
 * @access  Private
 */
router.get('/:id', controller.getById);

/**
 * @route   PUT /api/${routeName}/:id
 * @desc    Update ${resourceName}
 * @access  Private
 */
router.put('/:id', validate${controllerName}, controller.update);

/**
 * @route   DELETE /api/${routeName}/:id
 * @desc    Delete ${resourceName}
 * @access  Private
 */
router.delete('/:id', controller.delete);

export default router;
`;
};

/**
 * Generate Express.js controller
 */
export const generateExpressController = (
  formStructure: ExtractedFormStructure,
  resourceName: string
): string => {
  const entityName = toPascalCase(resourceName);
  const repositoryName = toCamelCase(resourceName) + 'Repository';

  return `import { Request, Response } from 'express';
import { ${entityName} } from '../models/${toCamelCase(resourceName)}.model';
import { ${entityName}Repository } from '../repositories/${toCamelCase(resourceName)}.repository';

export class ${entityName}Controller {
  private ${repositoryName}: ${entityName}Repository;

  constructor() {
    this.${repositoryName} = new ${entityName}Repository();
  }

  /**
   * Create new ${resourceName}
   */
  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = req.body;
      const result = await this.${repositoryName}.create(data);
      
      res.status(201).json({
        success: true,
        data: result,
        message: '${entityName} created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to create ${resourceName}',
      });
    }
  };

  /**
   * Get all ${resourceName}s
   */
  getAll = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await this.${repositoryName}.findAll(page, limit);
      
      res.status(200).json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to fetch ${resourceName}s',
      });
    }
  };

  /**
   * Get ${resourceName} by ID
   */
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.${repositoryName}.findById(id);
      
      if (!result) {
        res.status(404).json({
          success: false,
          message: '${entityName} not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to fetch ${resourceName}',
      });
    }
  };

  /**
   * Update ${resourceName}
   */
  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const data = req.body;
      
      const result = await this.${repositoryName}.update(id, data);
      
      if (!result) {
        res.status(404).json({
          success: false,
          message: '${entityName} not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: result,
        message: '${entityName} updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to update ${resourceName}',
      });
    }
  };

  /**
   * Delete ${resourceName}
   */
  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const result = await this.${repositoryName}.delete(id);
      
      if (!result) {
        res.status(404).json({
          success: false,
          message: '${entityName} not found',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        message: '${entityName} deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Failed to delete ${resourceName}',
      });
    }
  };
}
`;
};

/**
 * Generate backend validation (Express validator)
 */
export const generateBackendValidation = (
  formStructure: ExtractedFormStructure,
  resourceName: string
): string => {
  const validations = formStructure.fields.map((field) => {
    const fieldName = toCamelCase(field.label);
    return generateExpressValidationRule(field, fieldName);
  }).filter(Boolean).join(',\n');

  return `import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validate${toPascalCase(resourceName)} = [
${validations}
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: 'Validation failed',
      });
    }
    next();
  },
];
`;
};

/**
 * Generate Express validator rule for a field
 */
const generateExpressValidationRule = (field: ExtractedField, fieldName: string): string => {
  let validation = `  body('${fieldName}')`;
  
  if (field.required) {
    validation += `\n    .notEmpty().withMessage('${field.label} is required')`;
  }
  
  switch (field.type) {
    case FieldType.EMAIL:
      validation += `\n    .isEmail().withMessage('Invalid email format')`;
      break;
    case FieldType.PHONE:
      validation += `\n    .matches(/^[0-9]{10}$/).withMessage('Invalid phone number')`;
      break;
    case FieldType.NUMBER:
      validation += `\n    .isNumeric().withMessage('Must be a number')`;
      break;
    case FieldType.DATE:
      validation += `\n    .isISO8601().withMessage('Invalid date format')`;
      break;
  }
  
  return validation;
};

/**
 * Get TypeORM decorators for a field
 */
const getTypeORMDecorators = (field: ExtractedField): string => {
  const decorators: string[] = [];
  const columnType = getColumnType(field.type);
  
  if (field.type === FieldType.TEXT || field.type === FieldType.EMAIL) {
    decorators.push(`@Column({ type: '${columnType}', nullable: ${!field.required} })`);
  } else if (field.type === FieldType.NUMBER) {
    decorators.push(`@Column({ type: 'integer', nullable: ${!field.required} })`);
  } else if (field.type === FieldType.DATE) {
    decorators.push(`@Column({ type: 'date', nullable: ${!field.required} })`);
  } else if (field.type === FieldType.CHECKBOX) {
    decorators.push(`@Column({ type: 'boolean', default: false })`);
  } else {
    decorators.push(`@Column({ nullable: ${!field.required} })`);
  }
  
  return decorators.join('\n  ');
};

/**
 * Get SQL column type for field type
 */
const getColumnType = (fieldType: FieldType): string => {
  switch (fieldType) {
    case FieldType.TEXT:
    case FieldType.EMAIL:
    case FieldType.PHONE:
      return 'varchar';
    case FieldType.TEXTAREA:
      return 'text';
    case FieldType.NUMBER:
      return 'integer';
    case FieldType.DATE:
      return 'date';
    case FieldType.CHECKBOX:
      return 'boolean';
    default:
      return 'varchar';
  }
};

/**
 * Get SQL type for field type
 */
const getSQLType = (fieldType: FieldType): string => {
  switch (fieldType) {
    case FieldType.TEXT:
    case FieldType.EMAIL:
    case FieldType.PHONE:
      return 'VARCHAR(255)';
    case FieldType.TEXTAREA:
      return 'TEXT';
    case FieldType.NUMBER:
      return 'INTEGER';
    case FieldType.DATE:
      return 'DATE';
    case FieldType.CHECKBOX:
      return 'BOOLEAN DEFAULT FALSE';
    default:
      return 'VARCHAR(255)';
  }
};

/**
 * Get TypeScript type for field type
 */
const getTypeScriptType = (fieldType: FieldType): string => {
  switch (fieldType) {
    case FieldType.NUMBER:
      return 'number';
    case FieldType.DATE:
      return 'Date';
    case FieldType.CHECKBOX:
      return 'boolean';
    default:
      return 'string';
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
 * Convert string to kebab-case
 */
const toKebabCase = (str: string): string => {
  return str
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/-+/g, '-');
};

/**
 * Convert string to camelCase
 */
const toCamelCase = (str: string): string => {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
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
