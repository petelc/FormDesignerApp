import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FormInput } from '@/shared/components/forms';

interface CreateProjectModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (values: { name: string; description: string }) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const projectSchema = Yup.object({
  name: Yup.string()
    .required('Project name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters'),
  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
});

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  show,
  onHide,
  onSubmit,
  isLoading = false,
  error,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Project</Modal.Title>
      </Modal.Header>

      <Formik
        initialValues={{ name: '', description: '' }}
        validationSchema={projectSchema}
        onSubmit={async (values, { setSubmitting }) => {
          await onSubmit(values);
          setSubmitting(false);
        }}
      >
        {({ handleSubmit, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <FormInput
                name="name"
                label="Project Name"
                placeholder="e.g., Customer Registration Form"
              />

              <FormInput
                name="description"
                label="Description"
                as="textarea"
                rows={4}
                placeholder="Describe the purpose of this form project..."
              />

              <div className="alert alert-info mt-3">
                <small>
                  <strong>Tip:</strong> After creating the project, you'll be able to upload a
                  PDF form for AI-powered analysis and code generation.
                </small>
              </div>
            </Modal.Body>

            <Modal.Footer>
              <Button variant="secondary" onClick={onHide} disabled={isLoading || isSubmitting}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default CreateProjectModal;
