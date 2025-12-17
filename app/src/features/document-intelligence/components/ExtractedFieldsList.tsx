import { useState } from 'react';
import { Card, Badge, Button, Form, Row, Col, Accordion } from 'react-bootstrap';
import { ExtractedField, FieldType } from '../types';

interface ExtractedFieldsListProps {
  fields: ExtractedField[];
  onFieldUpdate?: (fieldId: string, updates: Partial<ExtractedField>) => void;
  onFieldAccept?: (fieldId: string) => void;
  onFieldReject?: (fieldId: string) => void;
}

const getFieldTypeColor = (type: FieldType): string => {
  switch (type) {
    case FieldType.TEXT:
      return 'primary';
    case FieldType.EMAIL:
      return 'info';
    case FieldType.PHONE:
      return 'success';
    case FieldType.NUMBER:
      return 'warning';
    case FieldType.DATE:
      return 'secondary';
    case FieldType.CHECKBOX:
    case FieldType.RADIO:
      return 'dark';
    case FieldType.SELECT:
      return 'info';
    case FieldType.TEXTAREA:
      return 'primary';
    default:
      return 'secondary';
  }
};

const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.9) return 'success';
  if (confidence >= 0.7) return 'warning';
  return 'danger';
};

const ExtractedFieldsList: React.FC<ExtractedFieldsListProps> = ({
  fields,
  onFieldUpdate,
  onFieldAccept,
  onFieldReject,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);

  // Group fields by page
  const fieldsByPage = fields.reduce((acc, field) => {
    if (!acc[field.page]) {
      acc[field.page] = [];
    }
    acc[field.page].push(field);
    return acc;
  }, {} as Record<number, ExtractedField[]>);

  const handleEditClick = (fieldId: string) => {
    setEditingField(fieldId);
  };

  const handleSaveEdit = (field: ExtractedField, updates: any) => {
    if (onFieldUpdate) {
      onFieldUpdate(field.id, updates);
    }
    setEditingField(null);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="mb-1">Extracted Fields</h5>
          <small className="text-muted">
            {fields.length} field{fields.length !== 1 ? 's' : ''} detected across{' '}
            {Object.keys(fieldsByPage).length} page{Object.keys(fieldsByPage).length !== 1 ? 's' : ''}
          </small>
        </div>
      </div>

      <Accordion defaultActiveKey="0">
        {Object.entries(fieldsByPage).map(([page, pageFields], pageIndex) => (
          <Accordion.Item key={page} eventKey={pageIndex.toString()}>
            <Accordion.Header>
              📄 Page {page} ({pageFields.length} field{pageFields.length !== 1 ? 's' : ''})
            </Accordion.Header>
            <Accordion.Body>
              {pageFields.map((field) => (
                <Card key={field.id} className="mb-3 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <h6 className="mb-0">{field.label}</h6>
                          <Badge bg={getFieldTypeColor(field.type)}>
                            {field.type}
                          </Badge>
                          {field.required && (
                            <Badge bg="danger">Required</Badge>
                          )}
                          <Badge bg={getConfidenceColor(field.confidence)}>
                            {(field.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        {editingField === field.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => setEditingField(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline-primary"
                              onClick={() => handleEditClick(field.id)}
                            >
                              ✏️ Edit
                            </Button>
                            {onFieldAccept && (
                              <Button
                                size="sm"
                                variant="outline-success"
                                onClick={() => onFieldAccept(field.id)}
                              >
                                ✓
                              </Button>
                            )}
                            {onFieldReject && (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => onFieldReject(field.id)}
                              >
                                ✕
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {editingField === field.id ? (
                      <Form
                        onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleSaveEdit(field, {
                            label: formData.get('label'),
                            type: formData.get('type') as FieldType,
                            required: formData.get('required') === 'on',
                            placeholder: formData.get('placeholder') || undefined,
                          });
                        }}
                      >
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-2">
                              <Form.Label>Label</Form.Label>
                              <Form.Control
                                name="label"
                                defaultValue={field.label}
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-2">
                              <Form.Label>Type</Form.Label>
                              <Form.Select name="type" defaultValue={field.type}>
                                {Object.values(FieldType).map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Form.Group className="mb-2">
                          <Form.Label>Placeholder</Form.Label>
                          <Form.Control
                            name="placeholder"
                            defaultValue={field.placeholder}
                          />
                        </Form.Group>
                        <Form.Check
                          type="checkbox"
                          name="required"
                          label="Required field"
                          defaultChecked={field.required}
                        />
                        <Button type="submit" variant="primary" size="sm" className="mt-2">
                          Save Changes
                        </Button>
                      </Form>
                    ) : (
                      <div>
                        {field.placeholder && (
                          <div className="mb-1">
                            <small className="text-muted">
                              Placeholder: {field.placeholder}
                            </small>
                          </div>
                        )}
                        {field.options && field.options.length > 0 && (
                          <div>
                            <small className="text-muted">
                              Options: {field.options.join(', ')}
                            </small>
                          </div>
                        )}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  );
};

export default ExtractedFieldsList;
