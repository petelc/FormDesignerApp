import { Card, Button, Badge, Form } from 'react-bootstrap';
import { FormField, FieldType } from '../types';
import { useAppDispatch } from '@/app/hooks';
import { deleteField, duplicateField } from '../slices/formBuilderSlice';

interface FieldRendererProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
}

const FieldRenderer: React.FC<FieldRendererProps> = ({ field, isSelected, onSelect }) => {
  const dispatch = useAppDispatch();

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('fieldId', field.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this field?')) {
      dispatch(deleteField(field.id));
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(duplicateField(field.id));
  };

  return (
    <Card
      className={`mb-2 cursor-pointer transition ${
        isSelected ? 'border-primary border-2 shadow' : 'border'
      }`}
      onClick={onSelect}
      draggable
      onDragStart={handleDragStart}
      style={{
        cursor: 'grab',
      }}
    >
      <Card.Body className="py-2">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1 me-2">
            {/* Field Label */}
            <div className="d-flex align-items-center gap-2 mb-1">
              <span>{getFieldIcon(field.type)}</span>
              <strong>{field.label}</strong>
              {field.required && (
                <Badge bg="danger" className="ms-1">
                  Required
                </Badge>
              )}
              <Badge bg="secondary">{getFieldTypeName(field.type)}</Badge>
            </div>

            {/* Field Preview */}
            <div className="mt-2">
              {renderFieldPreview(field)}
            </div>

            {/* Help Text */}
            {field.helpText && (
              <small className="text-muted d-block mt-1">
                💡 {field.helpText}
              </small>
            )}
          </div>

          {/* Actions */}
          {isSelected && (
            <div className="d-flex gap-1">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={handleDuplicate}
                title="Duplicate"
              >
                📋
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleDelete}
                title="Delete"
              >
                🗑️
              </Button>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

const renderFieldPreview = (field: FormField): React.JSX.Element => {
  const commonProps = {
    placeholder: field.placeholder,
    disabled: field.disabled,
    readOnly: field.readonly,
  };

  switch (field.type) {
    case FieldType.TEXT:
    case FieldType.EMAIL:
    case FieldType.PHONE:
      return <Form.Control type="text" {...commonProps} />;

    case FieldType.NUMBER:
      return (
        <Form.Control
          type="number"
          {...commonProps}
          min={field.min}
          max={field.max}
          step={field.step}
        />
      );

    case FieldType.DATE:
      return <Form.Control type="date" {...commonProps} />;

    case FieldType.TIME:
      return <Form.Control type="time" {...commonProps} />;

    case FieldType.TEXTAREA:
      return <Form.Control as="textarea" rows={3} {...commonProps} />;

    case FieldType.SELECT:
      return (
        <Form.Select {...commonProps}>
          <option value="">Select...</option>
          {field.options?.map((opt, idx) => (
            <option key={idx} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Form.Select>
      );

    case FieldType.RADIO:
      return (
        <div>
          {field.options?.map((opt, idx) => (
            <Form.Check
              key={idx}
              type="radio"
              label={opt.label}
              name={field.id}
              disabled={field.disabled}
            />
          ))}
        </div>
      );

    case FieldType.CHECKBOX:
      return <Form.Check type="checkbox" label={field.label} disabled={field.disabled} />;

    case FieldType.CHECKBOX_GROUP:
      return (
        <div>
          {field.options?.map((opt, idx) => (
            <Form.Check
              key={idx}
              type="checkbox"
              label={opt.label}
              disabled={field.disabled}
            />
          ))}
        </div>
      );

    case FieldType.FILE_UPLOAD:
      return (
        <div>
          <Form.Control
            type="file"
            {...commonProps}
            accept={field.accept}
            multiple={field.multiple}
          />
          <small className="text-muted">
            Max size: {formatFileSize(field.maxFileSize || 5242880)}
          </small>
        </div>
      );

    case FieldType.RATING:
      return (
        <div className="d-flex gap-1">
          {Array.from({ length: field.maxStars || 5 }).map((_, idx) => (
            <span key={idx} style={{ fontSize: '1.5rem', cursor: 'pointer' }}>
              ⭐
            </span>
          ))}
        </div>
      );

    case FieldType.SLIDER:
      return (
        <div>
          <Form.Range
            min={field.min || 0}
            max={field.max || 100}
            step={field.step || 1}
            disabled={field.disabled}
          />
          <div className="d-flex justify-content-between">
            <small>{field.min || 0}</small>
            <small>{field.max || 100}</small>
          </div>
        </div>
      );

    case FieldType.COLOR_PICKER:
      return <Form.Control type="color" value={field.defaultValue || '#000000'} />;

    case FieldType.TAGS:
      return (
        <div
          style={{
            border: '1px solid #ced4da',
            borderRadius: '0.375rem',
            padding: '0.375rem 0.75rem',
            minHeight: '38px',
          }}
        >
          <small className="text-muted">Tags will appear here...</small>
        </div>
      );

    case FieldType.RICH_TEXT:
      return (
        <div
          style={{
            border: '1px solid #ced4da',
            borderRadius: '0.375rem',
            padding: '0.75rem',
            minHeight: '100px',
            backgroundColor: '#fff',
          }}
        >
          <small className="text-muted">Rich text editor...</small>
        </div>
      );

    case FieldType.SIGNATURE:
      return (
        <div
          style={{
            border: '2px dashed #ced4da',
            borderRadius: '0.375rem',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f8f9fa',
          }}
        >
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✍️</div>
          <small className="text-muted">Sign here</small>
        </div>
      );

    case FieldType.DATE_RANGE:
      return (
        <div className="d-flex gap-2">
          <Form.Control type="date" placeholder="Start date" />
          <span className="align-self-center">to</span>
          <Form.Control type="date" placeholder="End date" />
        </div>
      );

    case FieldType.AUTO_COMPLETE:
      return (
        <Form.Control type="text" {...commonProps} list={`datalist-${field.id}`} />
      );

    default:
      return <div className="text-muted">Field preview not available</div>;
  }
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

const getFieldTypeName = (type: FieldType): string => {
  return type.replace(/_/g, ' ').toLowerCase();
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export default FieldRenderer;
