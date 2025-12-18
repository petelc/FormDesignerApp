import { Form, Card, Button, Badge } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { updateField } from '../slices/formBuilderSlice';
import { FormField, FieldType, FieldOption } from '../types';
import { useState } from 'react';
import ValidationBuilder from './ValidationBuilder';
import ConditionalLogicBuilder from './ConditionalLogicBuilder';

const PropertiesPanel = () => {
  const dispatch = useAppDispatch();
  const { currentForm, selectedFieldId } = useAppSelector((state) => state.formBuilder);

  if (!currentForm) {
    return (
      <div className="h-100 p-3 bg-light border-start">
        <p className="text-muted text-center mt-5">No form loaded</p>
      </div>
    );
  }

  const selectedField = currentForm.fields.find((f) => f.id === selectedFieldId);

  if (!selectedField) {
    return (
      <div className="h-100 p-3 bg-light border-start">
        <div className="text-center mt-5">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👈</div>
          <p className="text-muted">Select a field to edit its properties</p>
        </div>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<FormField>) => {
    dispatch(updateField({ fieldId: selectedField.id, updates }));
  };

  return (
    <div className="h-100 overflow-auto p-3 bg-light border-start">
      <h6 className="mb-3">Field Properties</h6>

      <Card className="mb-3">
        <Card.Header className="bg-white py-2">
          <div className="d-flex align-items-center">
            <span className="me-2">{getFieldIcon(selectedField.type)}</span>
            <Badge bg="secondary">{selectedField.type}</Badge>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Label */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Label</Form.Label>
            <Form.Control
              type="text"
              value={selectedField.label}
              onChange={(e) => handleUpdate({ label: e.target.value })}
            />
          </Form.Group>

          {/* Placeholder */}
          {showsPlaceholder(selectedField.type) && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Placeholder</Form.Label>
              <Form.Control
                type="text"
                value={selectedField.placeholder || ''}
                onChange={(e) => handleUpdate({ placeholder: e.target.value })}
              />
            </Form.Group>
          )}

          {/* Help Text */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Help Text</Form.Label>
            <Form.Control
              type="text"
              value={selectedField.helpText || ''}
              onChange={(e) => handleUpdate({ helpText: e.target.value })}
              placeholder="Optional hint for users"
            />
          </Form.Group>

          {/* Required */}
          <Form.Check
            type="checkbox"
            label="Required field"
            checked={selectedField.required}
            onChange={(e) => handleUpdate({ required: e.target.checked })}
            className="mb-2"
          />

          {/* Disabled */}
          <Form.Check
            type="checkbox"
            label="Disabled"
            checked={selectedField.disabled}
            onChange={(e) => handleUpdate({ disabled: e.target.checked })}
            className="mb-2"
          />

          {/* Read Only */}
          <Form.Check
            type="checkbox"
            label="Read only"
            checked={selectedField.readonly}
            onChange={(e) => handleUpdate({ readonly: e.target.checked })}
            className="mb-3"
          />

          {/* Field Width */}
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Width</Form.Label>
            <Form.Select
              value={selectedField.width}
              onChange={(e) =>
                handleUpdate({ width: e.target.value as 'full' | 'half' | 'third' | 'quarter' })
              }
            >
              <option value="full">Full (100%)</option>
              <option value="half">Half (50%)</option>
              <option value="third">Third (33%)</option>
              <option value="quarter">Quarter (25%)</option>
            </Form.Select>
          </Form.Group>

          {/* Type-specific properties */}
          {renderTypeSpecificProperties(selectedField, handleUpdate)}
        </Card.Body>
      </Card>

      {/* Validation Rules */}
      <Card className="mb-3">
        <Card.Header className="bg-white py-2">
          <strong>Validation</strong>
        </Card.Header>
        <Card.Body>
          <ValidationBuilder
            field={selectedField}
            onUpdate={(validations) => handleUpdate({ validations })}
          />
        </Card.Body>
      </Card>

      {/* Conditional Logic */}
      <Card className="mb-3">
        <Card.Header className="bg-white py-2">
          <strong>Conditional Display</strong>
        </Card.Header>
        <Card.Body>
          <ConditionalLogicBuilder
            field={selectedField}
            onUpdate={(conditional) => handleUpdate({ conditional })}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

const renderTypeSpecificProperties = (
  field: FormField,
  handleUpdate: (updates: Partial<FormField>) => void
): React.JSX.Element | null => {
  switch (field.type) {
    case FieldType.SELECT:
    case FieldType.RADIO:
    case FieldType.CHECKBOX_GROUP:
    case FieldType.MULTI_SELECT:
      return <OptionsEditor field={field} onUpdate={handleUpdate} />;

    case FieldType.NUMBER:
    case FieldType.SLIDER:
      return (
        <>
          <Form.Group className="mb-2">
            <Form.Label>Minimum</Form.Label>
            <Form.Control
              type="number"
              value={field.min || 0}
              onChange={(e) => handleUpdate({ min: parseInt(e.target.value) })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Maximum</Form.Label>
            <Form.Control
              type="number"
              value={field.max || 100}
              onChange={(e) => handleUpdate({ max: parseInt(e.target.value) })}
            />
          </Form.Group>
          {field.type === FieldType.SLIDER && (
            <Form.Group className="mb-2">
              <Form.Label>Step</Form.Label>
              <Form.Control
                type="number"
                value={field.step || 1}
                onChange={(e) => handleUpdate({ step: parseInt(e.target.value) })}
              />
            </Form.Group>
          )}
        </>
      );

    case FieldType.RATING:
      return (
        <Form.Group className="mb-2">
          <Form.Label>Max Stars</Form.Label>
          <Form.Control
            type="number"
            value={field.maxStars || 5}
            min={1}
            max={10}
            onChange={(e) => handleUpdate({ maxStars: parseInt(e.target.value) })}
          />
        </Form.Group>
      );

    case FieldType.FILE_UPLOAD:
      return (
        <>
          <Form.Group className="mb-2">
            <Form.Label>Accept File Types</Form.Label>
            <Form.Control
              type="text"
              value={field.accept || '*/*'}
              onChange={(e) => handleUpdate({ accept: e.target.value })}
              placeholder="e.g., image/*,.pdf"
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Max File Size (MB)</Form.Label>
            <Form.Control
              type="number"
              value={((field.maxFileSize || 5242880) / 1024 / 1024).toFixed(0)}
              onChange={(e) =>
                handleUpdate({ maxFileSize: parseInt(e.target.value) * 1024 * 1024 })
              }
            />
          </Form.Group>
          <Form.Check
            type="checkbox"
            label="Allow multiple files"
            checked={field.multiple}
            onChange={(e) => handleUpdate({ multiple: e.target.checked })}
          />
        </>
      );

    default:
      return null;
  }
};

interface OptionsEditorProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
}

const OptionsEditor: React.FC<OptionsEditorProps> = ({ field, onUpdate }) => {
  const [options, setOptions] = useState<FieldOption[]>(field.options || []);

  const handleAddOption = () => {
    const newOptions = [
      ...options,
      { label: `Option ${options.length + 1}`, value: `option${options.length + 1}` },
    ];
    setOptions(newOptions);
    onUpdate({ options: newOptions });
  };

  const handleUpdateOption = (index: number, updates: Partial<FieldOption>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    setOptions(newOptions);
    onUpdate({ options: newOptions });
  };

  const handleDeleteOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
    onUpdate({ options: newOptions });
  };

  return (
    <div>
      <Form.Label className="fw-semibold">Options</Form.Label>
      {options.map((option, index) => (
        <div key={index} className="d-flex gap-2 mb-2">
          <Form.Control
            type="text"
            value={option.label}
            onChange={(e) => handleUpdateOption(index, { label: e.target.value })}
            placeholder="Label"
            size="sm"
          />
          <Form.Control
            type="text"
            value={option.value}
            onChange={(e) => handleUpdateOption(index, { value: e.target.value })}
            placeholder="Value"
            size="sm"
          />
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDeleteOption(index)}
          >
            🗑️
          </Button>
        </div>
      ))}
      <Button variant="outline-primary" size="sm" onClick={handleAddOption}>
        + Add Option
      </Button>
    </div>
  );
};

const showsPlaceholder = (type: FieldType): boolean => {
  return [
    FieldType.TEXT,
    FieldType.EMAIL,
    FieldType.PHONE,
    FieldType.NUMBER,
    FieldType.TEXTAREA,
    FieldType.SELECT,
    FieldType.DATE,
    FieldType.TIME,
    FieldType.TAGS,
    FieldType.AUTO_COMPLETE,
  ].includes(type);
};

const getFieldIcon = (type: FieldType): string => {
  const icons: Record<FieldType, string> = {
    [FieldType.TEXT]: '📝',
    [FieldType.EMAIL]: '📧',
    [FieldType.PHONE]: '📱',
    [FieldType.NUMBER]: '🔢',
    [FieldType.DATE]: '📅',
    [FieldType.TIME]: '🕐',
    [FieldType.TEXTAREA]: '📄',
    [FieldType.SELECT]: '▼',
    [FieldType.RADIO]: '◉',
    [FieldType.CHECKBOX]: '☑',
    [FieldType.CHECKBOX_GROUP]: '☑',
    [FieldType.MULTI_SELECT]: '📋',
    [FieldType.FILE_UPLOAD]: '📎',
    [FieldType.RICH_TEXT]: '📝',
    [FieldType.SIGNATURE]: '✍️',
    [FieldType.RATING]: '⭐',
    [FieldType.TAGS]: '🏷️',
    [FieldType.COLOR_PICKER]: '🎨',
    [FieldType.SLIDER]: '📊',
    [FieldType.DATE_RANGE]: '📅',
    [FieldType.AUTO_COMPLETE]: '🔍',
    [FieldType.SECTION]: '📦',
    [FieldType.COLUMNS]: '⫿',
    [FieldType.DIVIDER]: '─',
  };
  return icons[type] || '❓';
};

export default PropertiesPanel;
