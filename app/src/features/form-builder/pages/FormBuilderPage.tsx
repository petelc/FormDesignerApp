import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, ButtonGroup } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useToast } from '@/shared/hooks';
import {
  createNewForm,
  togglePreviewMode,
  undo,
  redo,
  addSection,
} from '../slices/formBuilderSlice';
import FieldPalette from '../components/FieldPalette';
import FormCanvas from '../components/FormCanvas';
import PropertiesPanel from '../components/PropertiesPanel';
import { LoadingSpinner } from '@/shared/components/ui';

const FormBuilderPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();

  const {
    currentForm,
    isPreviewMode,
    historyIndex,
    history,
    isLoading,
  } = useAppSelector((state) => state.formBuilder);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  useEffect(() => {
    if (id) {
      // Load existing form
      // TODO: Load from API
      // For now, create a demo form
      dispatch(
        createNewForm({
          name: 'Sample Form',
          description: 'Get started by adding fields from the palette',
        })
      );
    } else {
      // Create new form
      dispatch(
        createNewForm({
          name: 'New Form',
          description: 'Build your form by dragging fields from the left',
        })
      );
    }
  }, [id, dispatch]);

  const handleSave = () => {
    if (!currentForm) return;

    // TODO: Save to API
    toast.success('Form saved successfully!');
  };

  const handleGenerateCode = () => {
    if (!currentForm) return;

    // Navigate to code generation page
    navigate(`/app/form-builder/generate`);
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading form builder..." />;
  }

  return (
    <div className="vh-100 d-flex flex-column">
      {/* Header */}
      <div className="bg-white border-bottom p-3">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <Button
              variant="link"
              onClick={() => navigate('/app/projects')}
              className="p-0 text-decoration-none"
            >
              ← Back
            </Button>
            <div>
              <h5 className="mb-0">{currentForm?.name || 'Form Builder'}</h5>
              {currentForm?.description && (
                <small className="text-muted">{currentForm.description}</small>
              )}
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            {/* Undo/Redo */}
            <ButtonGroup>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => dispatch(undo())}
                disabled={!canUndo}
                title="Undo (Ctrl+Z)"
              >
                ↶ Undo
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => dispatch(redo())}
                disabled={!canRedo}
                title="Redo (Ctrl+Y)"
              >
                ↷ Redo
              </Button>
            </ButtonGroup>

            {/* Sections */}
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => dispatch(addSection())}
            >
              📦 Add Section
            </Button>

            {/* Preview */}
            <Button
              variant={isPreviewMode ? 'primary' : 'outline-primary'}
              size="sm"
              onClick={() => dispatch(togglePreviewMode())}
            >
              👁️ {isPreviewMode ? 'Edit Mode' : 'Preview'}
            </Button>

            {/* Save */}
            <Button variant="outline-success" size="sm" onClick={handleSave}>
              💾 Save
            </Button>

            {/* Generate Code */}
            <Button
              variant="success"
              size="sm"
              onClick={handleGenerateCode}
              disabled={!currentForm || currentForm.fields.length === 0}
            >
              ⚡ Generate Code
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-grow-1 d-flex overflow-hidden">
        {/* Left Panel - Field Palette */}
        <div style={{ width: '250px', flexShrink: 0 }}>
          <FieldPalette />
        </div>

        {/* Center Panel - Canvas */}
        <div className="flex-grow-1 overflow-hidden">
          <FormCanvas />
        </div>

        {/* Right Panel - Properties */}
        <div style={{ width: '300px', flexShrink: 0 }}>
          <PropertiesPanel />
        </div>
      </div>

      {/* Footer - Stats */}
      {currentForm && (
        <div className="bg-light border-top px-3 py-2">
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              {currentForm.fields.length} field{currentForm.fields.length !== 1 ? 's' : ''} •{' '}
              {currentForm.sections.length} section{currentForm.sections.length !== 1 ? 's' : ''}
            </small>
            <small className="text-muted">
              Last updated: {new Date(currentForm.updatedAt).toLocaleTimeString()}
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormBuilderPage;
