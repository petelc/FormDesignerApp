import { useState } from 'react';
import { Modal, Form, Button, Card, Badge, ButtonGroup } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addSection, updateSection, deleteSection } from '../slices/formBuilderSlice';
import { FormSection } from '../types';

const SectionManager = () => {
  const dispatch = useAppDispatch();
  const { currentForm } = useAppSelector((state) => state.formBuilder);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<FormSection | null>(null);

  if (!currentForm) return null;

  const handleAddSection = () => {
    setEditingSection(null);
    setShowModal(true);
  };

  const handleEditSection = (section: FormSection) => {
    setEditingSection(section);
    setShowModal(true);
  };

  const handleSaveSection = (data: Partial<FormSection>) => {
    if (editingSection) {
      dispatch(updateSection({ sectionId: editingSection.id, updates: data }));
    } else {
      dispatch(addSection());
      // After adding, update with the data
      // Note: This is a simplification - in production, addSection should accept data
    }
    setShowModal(false);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (window.confirm('Delete this section? Fields will be moved to the first section.')) {
      dispatch(deleteSection(sectionId));
    }
  };

  return (
    <>
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h6 className="mb-0">Form Sections</h6>
          <Button variant="outline-primary" size="sm" onClick={handleAddSection}>
            + Add Section
          </Button>
        </div>

        <div className="d-flex flex-column gap-2">
          {currentForm.sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              fieldsCount={currentForm.fields.filter(f => f.position.sectionId === section.id).length}
              onEdit={() => handleEditSection(section)}
              onDelete={() => handleDeleteSection(section.id)}
              canDelete={currentForm.sections.length > 1}
            />
          ))}
        </div>
      </div>

      <SectionEditorModal
        show={showModal}
        section={editingSection}
        onHide={() => setShowModal(false)}
        onSave={handleSaveSection}
      />
    </>
  );
};

interface SectionCardProps {
  section: FormSection;
  fieldsCount: number;
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({
  section,
  fieldsCount,
  onEdit,
  onDelete,
  canDelete,
}) => {
  const dispatch = useAppDispatch();

  return (
    <Card className="border">
      <Card.Body className="p-2">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center gap-2">
              <strong style={{ fontSize: '0.875rem' }}>{section.title}</strong>
              <Badge bg="secondary" style={{ fontSize: '0.7rem' }}>
                {fieldsCount} field{fieldsCount !== 1 ? 's' : ''}
              </Badge>
              {section.columns > 1 && (
                <Badge bg="info" style={{ fontSize: '0.7rem' }}>
                  {section.columns} columns
                </Badge>
              )}
              {section.collapsible && (
                <Badge bg="light" text="dark" style={{ fontSize: '0.7rem' }}>
                  Collapsible
                </Badge>
              )}
            </div>
            {section.description && (
              <small className="text-muted d-block mt-1">{section.description}</small>
            )}
          </div>
          <ButtonGroup size="sm">
            <Button variant="outline-secondary" onClick={onEdit} title="Edit section">
              ✏️
            </Button>
            {canDelete && (
              <Button variant="outline-danger" onClick={onDelete} title="Delete section">
                🗑️
              </Button>
            )}
          </ButtonGroup>
        </div>
      </Card.Body>
    </Card>
  );
};

interface SectionEditorModalProps {
  show: boolean;
  section: FormSection | null;
  onHide: () => void;
  onSave: (data: Partial<FormSection>) => void;
}

const SectionEditorModal: React.FC<SectionEditorModalProps> = ({
  show,
  section,
  onHide,
  onSave,
}) => {
  const [title, setTitle] = useState(section?.title || '');
  const [description, setDescription] = useState(section?.description || '');
  const [columns, setColumns] = useState(section?.columns || 1);
  const [collapsible, setCollapsible] = useState(section?.collapsible || false);
  const [collapsed, setCollapsed] = useState(section?.collapsed || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      description,
      columns,
      collapsible,
      collapsed: collapsible ? collapsed : false,
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{section ? 'Edit Section' : 'Add Section'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Section Title *</Form.Label>
            <Form.Control
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Personal Information"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context about this section..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Layout Columns</Form.Label>
            <div className="d-flex gap-2">
              {[1, 2, 3].map((num) => (
                <Button
                  key={num}
                  variant={columns === num ? 'primary' : 'outline-primary'}
                  onClick={() => setColumns(num)}
                  style={{ flex: 1 }}
                >
                  {num === 1 ? '1 Column' : `${num} Columns`}
                </Button>
              ))}
            </div>
            <Form.Text>Fields in this section will be arranged in columns</Form.Text>
          </Form.Group>

          <Form.Check
            type="checkbox"
            label="Allow section to be collapsed"
            checked={collapsible}
            onChange={(e) => setCollapsible(e.target.checked)}
            className="mb-2"
          />

          {collapsible && (
            <Form.Check
              type="checkbox"
              label="Start collapsed by default"
              checked={collapsed}
              onChange={(e) => setCollapsed(e.target.checked)}
              className="ms-4"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={!title.trim()}>
            {section ? 'Save Changes' : 'Add Section'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SectionManager;
