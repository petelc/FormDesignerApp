import {
  ExtractedFormStructure,
  ExtractedField,
  FieldType,
} from '@/features/document-intelligence/types';

/**
 * Generate SQL Server schema (T-SQL)
 */
export const generateSQLServerSchema = (
  formStructure: ExtractedFormStructure,
  tableName: string
): string => {
  const fields = formStructure.fields.map((field) => {
    const columnName = toPascalCase(field.label);
    const sqlType = getSQLServerType(field.type);
    const nullable = field.required ? 'NOT NULL' : 'NULL';
    
    return `    [${columnName}] ${sqlType} ${nullable}`;
  });

  const tableNamePascal = toPascalCase(tableName);

  return `-- Auto-generated SQL Server schema for ${tableNamePascal}
-- Generated on ${new Date().toISOString()}

-- Create table
CREATE TABLE [dbo].[${tableNamePascal}] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
${fields.join(',\n')},
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
    [CreatedBy] NVARCHAR(255) NULL,
    [UpdatedBy] NVARCHAR(255) NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0
);

-- Create indexes
CREATE NONCLUSTERED INDEX [IX_${tableNamePascal}_CreatedAt] 
    ON [dbo].[${tableNamePascal}] ([CreatedAt] DESC);

CREATE NONCLUSTERED INDEX [IX_${tableNamePascal}_IsDeleted] 
    ON [dbo].[${tableNamePascal}] ([IsDeleted]);

-- Create trigger for UpdatedAt
GO
CREATE TRIGGER [dbo].[TR_${tableNamePascal}_UpdatedAt]
ON [dbo].[${tableNamePascal}]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[${tableNamePascal}]
    SET [UpdatedAt] = GETDATE()
    FROM [dbo].[${tableNamePascal}] t
    INNER JOIN inserted i ON t.[Id] = i.[Id];
END;
GO

-- Stored procedure for Insert
CREATE PROCEDURE [dbo].[sp_Insert${tableNamePascal}]
${generateSPParameters(formStructure.fields, 'insert')}
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO [dbo].[${tableNamePascal}] (
${formStructure.fields.map(f => `        [${toPascalCase(f.label)}]`).join(',\n')},
        [CreatedBy]
    )
    VALUES (
${formStructure.fields.map(f => `        @${toPascalCase(f.label)}`).join(',\n')},
        @CreatedBy
    );
    
    SELECT SCOPE_IDENTITY() AS Id;
END;
GO

-- Stored procedure for Update
CREATE PROCEDURE [dbo].[sp_Update${tableNamePascal}]
    @Id INT,
${generateSPParameters(formStructure.fields, 'update')}
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE [dbo].[${tableNamePascal}]
    SET
${formStructure.fields.map(f => `        [${toPascalCase(f.label)}] = @${toPascalCase(f.label)}`).join(',\n')},
        [UpdatedBy] = @UpdatedBy,
        [UpdatedAt] = GETDATE()
    WHERE [Id] = @Id AND [IsDeleted] = 0;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO

-- Stored procedure for Get by Id
CREATE PROCEDURE [dbo].[sp_Get${tableNamePascal}ById]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM [dbo].[${tableNamePascal}]
    WHERE [Id] = @Id AND [IsDeleted] = 0;
END;
GO

-- Stored procedure for Get All (with pagination)
CREATE PROCEDURE [dbo].[sp_GetAll${tableNamePascal}]
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM [dbo].[${tableNamePascal}]
    WHERE [IsDeleted] = 0
    ORDER BY [CreatedAt] DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;
    
    -- Get total count
    SELECT COUNT(*) AS TotalCount
    FROM [dbo].[${tableNamePascal}]
    WHERE [IsDeleted] = 0;
END;
GO

-- Stored procedure for Soft Delete
CREATE PROCEDURE [dbo].[sp_Delete${tableNamePascal}]
    @Id INT,
    @DeletedBy NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE [dbo].[${tableNamePascal}]
    SET [IsDeleted] = 1,
        [UpdatedBy] = @DeletedBy,
        [UpdatedAt] = GETDATE()
    WHERE [Id] = @Id;
    
    SELECT @@ROWCOUNT AS RowsAffected;
END;
GO
`;
};

/**
 * Generate .NET Core controller
 */
export const generateDotNetController = (
  formStructure: ExtractedFormStructure,
  resourceName: string
): string => {
  const entityName = toPascalCase(resourceName);
  const dtoName = `${entityName}Dto`;
  const createDtoName = `Create${entityName}Dto`;
  const updateDtoName = `Update${entityName}Dto`;

  return `using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ${entityName}Api.Models;
using ${entityName}Api.Services;
using ${entityName}Api.DTOs;

namespace ${entityName}Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ${entityName}Controller : ControllerBase
{
    private readonly I${entityName}Service _service;
    private readonly ILogger<${entityName}Controller> _logger;

    public ${entityName}Controller(
        I${entityName}Service service,
        ILogger<${entityName}Controller> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Get all ${resourceName}s with pagination
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<${dtoName}>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<${dtoName}>>> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var result = await _service.GetAllAsync(pageNumber, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ${resourceName}s");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// Get ${resourceName} by ID
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(${dtoName}), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<${dtoName}>> GetById(int id)
    {
        try
        {
            var result = await _service.GetByIdAsync(id);
            
            if (result == null)
            {
                return NotFound(new { message = "${entityName} not found" });
            }
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting ${resourceName} {Id}", id);
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// Create new ${resourceName}
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(${dtoName}), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<${dtoName}>> Create([FromBody] ${createDtoName} dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _service.CreateAsync(dto);
            
            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Id },
                result
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating ${resourceName}");
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// Update ${resourceName}
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(${dtoName}), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<${dtoName}>> Update(
        int id,
        [FromBody] ${updateDtoName} dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _service.UpdateAsync(id, dto);
            
            if (result == null)
            {
                return NotFound(new { message = "${entityName} not found" });
            }
            
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating ${resourceName} {Id}", id);
            return StatusCode(500, new { message = "An error occurred" });
        }
    }

    /// <summary>
    /// Delete ${resourceName}
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var success = await _service.DeleteAsync(id);
            
            if (!success)
            {
                return NotFound(new { message = "${entityName} not found" });
            }
            
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting ${resourceName} {Id}", id);
            return StatusCode(500, new { message = "An error occurred" });
        }
    }
}
`;
};

/**
 * Generate .NET DTOs
 */
export const generateDotNetDTOs = (
  formStructure: ExtractedFormStructure,
  entityName: string
): string => {
  const fields = formStructure.fields.map((field) => {
    const propName = toPascalCase(field.label);
    const csType = getCSharpType(field.type);
    const nullable = !field.required ? '?' : '';
    const required = field.required ? '[Required]' : '';
    
    return {
      propName,
      csType,
      nullable,
      required,
      validation: getCSharpValidation(field),
    };
  });

  return `using System.ComponentModel.DataAnnotations;

namespace ${entityName}Api.DTOs;

/// <summary>
/// DTO for ${entityName}
/// </summary>
public class ${entityName}Dto
{
    public int Id { get; set; }
${fields.map(f => `    public ${f.csType}${f.nullable} ${f.propName} { get; set; }`).join('\n')}
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public string? UpdatedBy { get; set; }
}

/// <summary>
/// DTO for creating ${entityName}
/// </summary>
public class Create${entityName}Dto
{
${fields.map(f => `    ${f.validation}\n    ${f.required}\n    public ${f.csType}${f.nullable} ${f.propName} { get; set; }`).join('\n\n')}
}

/// <summary>
/// DTO for updating ${entityName}
/// </summary>
public class Update${entityName}Dto
{
${fields.map(f => `    ${f.validation}\n    ${f.required}\n    public ${f.csType}${f.nullable} ${f.propName} { get; set; }`).join('\n\n')}
}
`;
};

/**
 * Generate .NET Entity
 */
export const generateDotNetEntity = (
  formStructure: ExtractedFormStructure,
  entityName: string
): string => {
  const fields = formStructure.fields.map((field) => {
    const propName = toPascalCase(field.label);
    const csType = getCSharpType(field.type);
    const nullable = !field.required ? '?' : '';
    const columnAttr = getSQLServerColumnAttribute(field);
    
    return `    ${columnAttr}\n    public ${csType}${nullable} ${propName} { get; set; }`;
  });

  return `using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ${entityName}Api.Models;

[Table("${entityName}")]
public class ${entityName}
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

${fields.join('\n\n')}

    [Required]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Required]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(255)]
    public string? CreatedBy { get; set; }

    [MaxLength(255)]
    public string? UpdatedBy { get; set; }

    [Required]
    public bool IsDeleted { get; set; } = false;
}
`;
};

// Helper functions

const generateSPParameters = (fields: ExtractedField[], type: 'insert' | 'update'): string => {
  const params = fields.map((field) => {
    const paramName = `@${toPascalCase(field.label)}`;
    const sqlType = getSQLServerType(field.type);
    const nullable = field.required ? '' : ' = NULL';
    return `    ${paramName} ${sqlType}${nullable}`;
  });
  
  if (type === 'insert') {
    params.push('    @CreatedBy NVARCHAR(255) = NULL');
  } else {
    params.push('    @UpdatedBy NVARCHAR(255) = NULL');
  }
  
  return params.join(',\n');
};

const getSQLServerType = (fieldType: FieldType): string => {
  switch (fieldType) {
    case FieldType.TEXT:
    case FieldType.EMAIL:
    case FieldType.PHONE:
      return 'NVARCHAR(255)';
    case FieldType.TEXTAREA:
      return 'NVARCHAR(MAX)';
    case FieldType.NUMBER:
      return 'INT';
    case FieldType.DATE:
      return 'DATE';
    case FieldType.CHECKBOX:
      return 'BIT';
    default:
      return 'NVARCHAR(255)';
  }
};

const getCSharpType = (fieldType: FieldType): string => {
  switch (fieldType) {
    case FieldType.NUMBER:
      return 'int';
    case FieldType.DATE:
      return 'DateTime';
    case FieldType.CHECKBOX:
      return 'bool';
    default:
      return 'string';
  }
};

const getSQLServerColumnAttribute = (field: ExtractedField): string => {
  const attrs: string[] = [];
  
  if (field.required) {
    attrs.push('[Required]');
  }
  
  switch (field.type) {
    case FieldType.TEXT:
    case FieldType.EMAIL:
    case FieldType.PHONE:
      attrs.push('[MaxLength(255)]');
      break;
  }
  
  return attrs.join('\n    ');
};

const getCSharpValidation = (field: ExtractedField): string => {
  const validations: string[] = [];
  
  switch (field.type) {
    case FieldType.EMAIL:
      validations.push('[EmailAddress(ErrorMessage = "Invalid email format")]');
      break;
    case FieldType.PHONE:
      validations.push('[Phone(ErrorMessage = "Invalid phone number")]');
      break;
    case FieldType.TEXT:
      if (field.required) {
        validations.push('[StringLength(255, MinimumLength = 1)]');
      }
      break;
  }
  
  return validations.join('\n    ');
};

const toPascalCase = (str: string): string => {
  return str
    .replace(/[^a-zA-Z0-9]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
};
