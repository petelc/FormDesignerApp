import { useState } from 'react';
import { Card, Alert } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addField, reorderField, selectField } from '../slices/formBuilderSlice';
import { FieldType } from '../types';
import FieldRenderer from './FieldRenderer';

const FormCanvas = () => {
  const dispatch = useAppDispatch();
  const { currentForm, draggedFieldType, selectedFieldId } = useAppSelector(
    (state) => state.formBuilder
  );

  if (!currentForm) {
    return (
      <div className="h-100 d-flex align-items-center justify-content-center">
        <Alert variant="info">
          <h5>No Form Selected</h5>
          <p className="mb-0">Create a new form or load an existing one to get started.</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-100 overflow-auto p-4">
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">{currentForm.name}</h5>
          {currentForm.description && (
            <small className="text-muted">{currentForm.description}</small>
          )}
        </Card.Header>
        <Card.Body>
          {currentForm.sections.map((section) => (
            <SectionCanvas
              key={section.id}
              section={section}
              fields={currentForm.fields.filter(
                (f) => f.position.sectionId === section.id
              )}
              selectedFieldId={selectedFieldId}
              draggedFieldType={draggedFieldType}
            />
          ))}
        </Card.Body>
      </Card>
    </div>
  );
};

interface SectionCanvasProps {
  section: any;
  fields: any[];
  selectedFieldId: string | null;
  draggedFieldType: FieldType | null;
}

const SectionCanvas: React.FC<SectionCanvasProps> = ({
  section,
  fields,
  selectedFieldId,
  draggedFieldType,
}) => {
  const dispatch = useAppDispatch();

  const sortedFields = [...fields].sort((a, b) => a.position.order - b.position.order);

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    e.stopPropagation();

    const fieldType = e.dataTransfer.getData('fieldType') as FieldType;
    const fieldId = e.dataTransfer.getData('fieldId');

    if (fieldType && !fieldId) {
      // New field from palette
      dispatch(
        addField({
          fieldType,
          sectionId: section.id,
          position,
        })
      );
    } else if (fieldId) {
      // Reorder existing field
      dispatch(
        reorderField({
          fieldId,
          newPosition: position,
          newSectionId: section.id,
        })
      );
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div className="mb-4">
      {section.title !== 'Form Fields' && (
        <div className="mb-3">
          <h6>{section.title}</h6>
          {section.description && (
            <small className="text-muted">{section.description}</small>
          )}
        </div>
      )}

      {/* Drop zone before first field */}
      {sortedFields.length === 0 ? (
        <DropZone
          position={0}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          isActive={!!draggedFieldType}
          isEmpty={true}
        />
      ) : (
        <>
          <DropZone
            position={0}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            isActive={!!draggedFieldType}
          />

          {/* Render fields with drop zones between */}
          {sortedFields.map((field, index) => (
            <div key={field.id}>
              <FieldRenderer
                field={field}
                isSelected={field.id === selectedFieldId}
                onSelect={() => dispatch(selectField(field.id))}
              />
              <DropZone
                position={index + 1}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                isActive={!!draggedFieldType}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};

interface DropZoneProps {
  position: number;
  onDrop: (e: React.DragEvent, position: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  isActive: boolean;
  isEmpty?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({
  position,
  onDrop,
  onDragOver,
  isActive,
  isEmpty = false,
}) => {
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      className={`drop-zone ${isActive ? 'drop-zone-active' : ''} ${
        isOver ? 'drop-zone-over' : ''
      } ${isEmpty ? 'drop-zone-empty' : ''}`}
      onDrop={(e) => onDrop(e, position)}
      onDragOver={(e) => {
        onDragOver(e);
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      style={{
        minHeight: isEmpty ? '200px' : '20px',
        margin: isEmpty ? '0' : '4px 0',
        border: isEmpty
          ? '2px dashed #dee2e6'
          : isActive
          ? '2px dashed transparent'
          : 'none',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        backgroundColor: isOver ? 'rgba(13, 110, 253, 0.1)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isEmpty && (
        <div className="text-center text-muted">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h5>Drop fields here to start building</h5>
          <p>Drag fields from the palette on the left</p>
        </div>
      )}
      {!isEmpty && isActive && !isOver && (
        <div
          style={{
            fontSize: '0.75rem',
            color: '#6c757d',
            textAlign: 'center',
          }}
        >
          + Drop here
        </div>
      )}
    </div>
  );
};

export default FormCanvas;
