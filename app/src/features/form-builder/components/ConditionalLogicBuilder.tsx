import { useState, useEffect } from 'react';
import { Form, Button, Card, Badge, Alert } from 'react-bootstrap';
import { useAppSelector } from '@/app/hooks';
import { ConditionalRule, FormField, FieldType } from '../types';

interface ConditionalLogicBuilderProps {
  field: FormField;
  onUpdate: (conditional?: ConditionalRule) => void;
}

const ConditionalLogicBuilder: React.FC<ConditionalLogicBuilderProps> = ({
  field,
  onUpdate,
}) => {
  const { currentForm } = useAppSelector((state) => state.formBuilder);
  const [enabled, setEnabled] = useState(!!field.conditional);
  const [rule, setRule] = useState<ConditionalRule>(
    field.conditional || {
      show: true,
      when: '',
      operator: 'equals',
      value: '',
    }
  );

  // Get available fields (exclude current field and those that come after)
  const availableFields = currentForm?.fields.filter(
    (f) =>
      f.id !== field.id &&
      f.position.order < field.position.order &&
      f.position.sectionId === field.position.sectionId
  ) || [];

  useEffect(() => {
    if (enabled) {
      onUpdate(rule);
    } else {
      onUpdate(undefined);
    }
  }, [enabled, rule]);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    if (!checked) {
      onUpdate(undefined);
    }
  };

  const updateRule = (updates: Partial<ConditionalRule>) => {
    const updated = { ...rule, ...updates };
    setRule(updated);
    if (enabled) {
      onUpdate(updated);
    }
  };

  const selectedField = availableFields.find((f) => f.id === rule.when);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong style={{ fontSize: '0.875rem' }}>Conditional Logic</strong>
        {enabled && <Badge bg="warning" text="dark">Active</Badge>}
      </div>

      <Form.Check
        type="switch"
        label="Enable conditional display"
        checked={enabled}
        onChange={(e) => handleToggle(e.target.checked)}
        className="mb-3"
      />

      {enabled && (
        <>
          {availableFields.length === 0 ? (
            <Alert variant="info" className="py-2 px-3 small">
              No fields available for conditions. Add fields before this one in the form.
            </Alert>
          ) : (
            <Card className="border">
              <Card.Body className="p-3">
                {/* Show/Hide */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '0.875rem' }}>Action</Form.Label>
                  <Form.Select
                    size="sm"
                    value={rule.show ? 'show' : 'hide'}
                    onChange={(e) => updateRule({ show: e.target.value === 'show' })}
                  >
                    <option value="show">Show this field</option>
                    <option value="hide">Hide this field</option>
                  </Form.Select>
                </Form.Group>

                {/* When Field */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontSize: '0.875rem' }}>When</Form.Label>
                  <Form.Select
                    size="sm"
                    value={rule.when}
                    onChange={(e) => updateRule({ when: e.target.value })}
                  >
                    <option value="">Select a field...</option>
                    {availableFields.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Operator */}
                {rule.when && (
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontSize: '0.875rem' }}>Condition</Form.Label>
                    <Form.Select
                      size="sm"
                      value={rule.operator}
                      onChange={(e) =>
                        updateRule({
                          operator: e.target.value as ConditionalRule['operator'],
                        })
                      }
                    >
                      <option value="equals">Is equal to</option>
                      <option value="notEquals">Is not equal to</option>
                      {selectedField?.type === FieldType.TEXT && (
                        <>
                          <option value="contains">Contains</option>
                        </>
                      )}
                      {(selectedField?.type === FieldType.NUMBER ||
                        selectedField?.type === FieldType.SLIDER) && (
                        <>
                          <option value="greaterThan">Is greater than</option>
                          <option value="lessThan">Is less than</option>
                        </>
                      )}
                    </Form.Select>
                  </Form.Group>
                )}

                {/* Value */}
                {rule.when && (
                  <Form.Group>
                    <Form.Label style={{ fontSize: '0.875rem' }}>Value</Form.Label>
                    {selectedField && renderValueInput(selectedField, rule.value, (value) =>
                      updateRule({ value })
                    )}
                  </Form.Group>
                )}

                {/* Preview */}
                {rule.when && rule.value && (
                  <Alert variant="light" className="mt-3 py-2 px-3 small mb-0">
                    <strong>Rule:</strong>{' '}
                    {rule.show ? 'Show' : 'Hide'} <strong>{field.label}</strong> when{' '}
                    <strong>{selectedField?.label}</strong> {getOperatorText(rule.operator)}{' '}
                    <strong>{getValueDisplay(selectedField, rule.value)}</strong>
                  </Alert>
                )}
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {!enabled && (
        <small className="text-muted">This field will always be visible</small>
      )}
    </div>
  );
};

// Helper function to render value input based on field type
const renderValueInput = (
  field: FormField,
  value: any,
  onChange: (value: any) => void
): React.JSX.Element => {
  switch (field.type) {
    case FieldType.SELECT:
    case FieldType.RADIO:
      return (
        <Form.Select size="sm" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select value...</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Form.Select>
      );

    case FieldType.CHECKBOX:
      return (
        <Form.Select size="sm" value={value} onChange={(e) => onChange(e.target.value)}>
          <option value="true">Checked</option>
          <option value="false">Unchecked</option>
        </Form.Select>
      );

    case FieldType.NUMBER:
    case FieldType.SLIDER:
      return (
        <Form.Control
          type="number"
          size="sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter number..."
        />
      );

    case FieldType.DATE:
      return (
        <Form.Control
          type="date"
          size="sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    default:
      return (
        <Form.Control
          type="text"
          size="sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter value..."
        />
      );
  }
};

const getOperatorText = (operator: ConditionalRule['operator']): string => {
  const texts: Record<ConditionalRule['operator'], string> = {
    equals: 'is equal to',
    notEquals: 'is not equal to',
    contains: 'contains',
    greaterThan: 'is greater than',
    lessThan: 'is less than',
  };
  return texts[operator];
};

const getValueDisplay = (field: FormField | undefined, value: any): string => {
  if (!field) return value;

  if (field.type === FieldType.SELECT || field.type === FieldType.RADIO) {
    const option = field.options?.find((opt) => opt.value === value);
    return option?.label || value;
  }

  if (field.type === FieldType.CHECKBOX) {
    return value === 'true' ? 'Checked' : 'Unchecked';
  }

  return value;
};

export default ConditionalLogicBuilder;
