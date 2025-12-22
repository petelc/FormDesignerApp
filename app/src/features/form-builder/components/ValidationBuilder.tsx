import { useState } from 'react';
import { Form, Button, Card, Badge, InputGroup } from 'react-bootstrap';
import { ValidationRule, FormField, FieldType } from '../types';

interface ValidationBuilderProps {
  field: FormField;
  onUpdate: (validations: ValidationRule[]) => void;
}

const ValidationBuilder: React.FC<ValidationBuilderProps> = ({ field, onUpdate }) => {
  const [rules, setRules] = useState<ValidationRule[]>(field.validations || []);

  const addRule = (type: ValidationRule['type']) => {
    const newRule: ValidationRule = {
      type,
      value: getDefaultValue(type, field.type),
      message: getDefaultMessage(type, field.label),
    };
    const updated = [...rules, newRule];
    setRules(updated);
    onUpdate(updated);
  };

  const updateRule = (index: number, updates: Partial<ValidationRule>) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], ...updates };
    setRules(updated);
    onUpdate(updated);
  };

  const removeRule = (index: number) => {
    const updated = rules.filter((_, i) => i !== index);
    setRules(updated);
    onUpdate(updated);
  };

  const availableRules = getAvailableRules(field.type);
  const usedRuleTypes = rules.map(r => r.type);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong style={{ fontSize: '0.875rem' }}>Validation Rules</strong>
        {rules.length > 0 && (
          <Badge bg="primary">{rules.length} rule{rules.length !== 1 ? 's' : ''}</Badge>
        )}
      </div>

      {/* Existing Rules */}
      {rules.map((rule, index) => (
        <Card key={index} className="mb-2 border">
          <Card.Body className="p-2">
            <div className="d-flex align-items-start gap-2">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <Badge bg="secondary">{getRuleLabel(rule.type)}</Badge>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-danger"
                    onClick={() => removeRule(index)}
                  >
                    🗑️
                  </Button>
                </div>

                {/* Rule Configuration */}
                {rule.type !== 'required' && rule.type !== 'email' && rule.type !== 'phone' && (
                  <Form.Group className="mb-2">
                    <Form.Label style={{ fontSize: '0.75rem' }}>
                      {getValueLabel(rule.type)}
                    </Form.Label>
                    <Form.Control
                      type={getValueInputType(rule.type)}
                      size="sm"
                      value={rule.value || ''}
                      onChange={(e) => updateRule(index, { value: e.target.value })}
                      placeholder={getValuePlaceholder(rule.type)}
                    />
                  </Form.Group>
                )}

                {/* Error Message */}
                <Form.Group>
                  <Form.Label style={{ fontSize: '0.75rem' }}>Error Message</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    size="sm"
                    value={rule.message || ''}
                    onChange={(e) => updateRule(index, { message: e.target.value })}
                    placeholder="Custom error message..."
                  />
                </Form.Group>
              </div>
            </div>
          </Card.Body>
        </Card>
      ))}

      {/* Add Rule Dropdown */}
      {availableRules.filter(r => !usedRuleTypes.includes(r.type) || r.allowMultiple).length > 0 && (
        <Form.Select
          size="sm"
          value=""
          onChange={(e) => {
            if (e.target.value) {
              addRule(e.target.value as ValidationRule['type']);
              e.target.value = '';
            }
          }}
          className="mb-2"
        >
          <option value="">+ Add validation rule...</option>
          {availableRules
            .filter(r => !usedRuleTypes.includes(r.type) || r.allowMultiple)
            .map((rule) => (
              <option key={rule.type} value={rule.type}>
                {rule.label}
              </option>
            ))}
        </Form.Select>
      )}

      {rules.length === 0 && (
        <small className="text-muted">No validation rules added</small>
      )}
    </div>
  );
};

// Helper functions
const getAvailableRules = (fieldType: FieldType) => {
  const common = [
    { type: 'required' as const, label: 'Required', allowMultiple: false },
  ];

  const textRules = [
    { type: 'minLength' as const, label: 'Minimum Length', allowMultiple: false },
    { type: 'maxLength' as const, label: 'Maximum Length', allowMultiple: false },
    { type: 'pattern' as const, label: 'Pattern (Regex)', allowMultiple: false },
  ];

  const numberRules = [
    { type: 'min' as const, label: 'Minimum Value', allowMultiple: false },
    { type: 'max' as const, label: 'Maximum Value', allowMultiple: false },
  ];

  switch (fieldType) {
    case FieldType.EMAIL:
      return [
        ...common,
        { type: 'email' as const, label: 'Valid Email Format', allowMultiple: false },
        ...textRules,
      ];

    case FieldType.PHONE:
      return [
        ...common,
        { type: 'phone' as const, label: 'Valid Phone Format', allowMultiple: false },
        ...textRules,
      ];

    case FieldType.TEXT:
    case FieldType.TEXTAREA:
      return [...common, ...textRules];

    case FieldType.NUMBER:
    case FieldType.SLIDER:
      return [...common, ...numberRules];

    case FieldType.DATE:
    case FieldType.TIME:
      return [
        ...common,
        { type: 'min' as const, label: 'Earliest Date/Time', allowMultiple: false },
        { type: 'max' as const, label: 'Latest Date/Time', allowMultiple: false },
      ];

    default:
      return common;
  }
};

const getRuleLabel = (type: ValidationRule['type']): string => {
  const labels: Record<ValidationRule['type'], string> = {
    required: 'Required',
    minLength: 'Min Length',
    maxLength: 'Max Length',
    pattern: 'Pattern',
    email: 'Email Format',
    phone: 'Phone Format',
    min: 'Min Value',
    max: 'Max Value',
    custom: 'Custom',
  };
  return labels[type] || type;
};

const getValueLabel = (type: ValidationRule['type']): string => {
  const labels: Record<string, string> = {
    minLength: 'Minimum characters',
    maxLength: 'Maximum characters',
    pattern: 'Regular expression',
    min: 'Minimum value',
    max: 'Maximum value',
  };
  return labels[type] || 'Value';
};

const getValueInputType = (type: ValidationRule['type']): string => {
  if (type === 'min' || type === 'max' || type === 'minLength' || type === 'maxLength') {
    return 'number';
  }
  return 'text';
};

const getValuePlaceholder = (type: ValidationRule['type']): string => {
  const placeholders: Record<string, string> = {
    minLength: 'e.g., 3',
    maxLength: 'e.g., 100',
    pattern: 'e.g., ^[A-Z].*',
    min: 'e.g., 0',
    max: 'e.g., 100',
  };
  return placeholders[type] || '';
};

const getDefaultValue = (type: ValidationRule['type'], fieldType: FieldType): any => {
  if (type === 'minLength') return '1';
  if (type === 'maxLength') {
    if (fieldType === FieldType.TEXTAREA) return '500';
    return '100';
  }
  if (type === 'min') return '0';
  if (type === 'max') return '100';
  if (type === 'pattern' && fieldType === FieldType.PHONE) return '^\\d{10}$';
  return '';
};

const getDefaultMessage = (type: ValidationRule['type'], fieldLabel: string): string => {
  const messages: Record<ValidationRule['type'], string> = {
    required: `${fieldLabel} is required`,
    minLength: `${fieldLabel} must be at least {value} characters`,
    maxLength: `${fieldLabel} must not exceed {value} characters`,
    pattern: `${fieldLabel} format is invalid`,
    email: 'Please enter a valid email address',
    phone: 'Please enter a valid phone number',
    min: `${fieldLabel} must be at least {value}`,
    max: `${fieldLabel} must not exceed {value}`,
    custom: 'Validation failed',
  };
  return messages[type] || 'Invalid value';
};

export default ValidationBuilder;
