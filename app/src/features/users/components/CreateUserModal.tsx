import { Modal, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { FormInput, FormCheckbox } from '@/shared/components/forms';
import { UserRole } from '@/shared/types';

interface CreateUserModalProps {
  show: boolean;
  onHide: () => void;
  onSubmit: (values: any) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

const userSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'Must be at least 2 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Must be at least 2 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Must contain at least one number'),
  roleAdmin: Yup.boolean(),
  roleFormCreator: Yup.boolean(),
  roleFormViewer: Yup.boolean(),
  isActive: Yup.boolean(),
});

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  show,
  onHide,
  onSubmit,
  isLoading = false,
  error,
}) => {
  const handleSubmit = async (values: any) => {
    // Convert role checkboxes to roles array
    const roles: UserRole[] = [];
    if (values.roleAdmin) roles.push(UserRole.ADMIN);
    if (values.roleFormCreator) roles.push(UserRole.FORM_CREATOR);
    if (values.roleFormViewer) roles.push(UserRole.FORM_VIEWER);
    if (roles.length === 0) roles.push(UserRole.USER);

    await onSubmit({
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password,
      roles,
      isActive: values.isActive,
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New User</Modal.Title>
      </Modal.Header>

      <Formik
        initialValues={{
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          roleAdmin: false,
          roleFormCreator: true,
          roleFormViewer: false,
          isActive: true,
        }}
        validationSchema={userSchema}
        onSubmit={handleSubmit}
      >
        {({ handleSubmit, isSubmitting }) => (
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              {error && <Alert variant="danger">{error}</Alert>}

              <Row>
                <Col md={6}>
                  <FormInput
                    name="firstName"
                    label="First Name"
                    placeholder="John"
                  />
                </Col>
                <Col md={6}>
                  <FormInput
                    name="lastName"
                    label="Last Name"
                    placeholder="Doe"
                  />
                </Col>
              </Row>

              <FormInput
                name="email"
                label="Email Address"
                type="email"
                placeholder="john.doe@example.com"
              />

              <FormInput
                name="password"
                label="Password"
                type="password"
                placeholder="Enter a strong password"
                helpText="Must be 8+ characters with uppercase, lowercase, and number"
              />

              <Form.Group className="mb-3">
                <Form.Label>Roles</Form.Label>
                <div>
                  <FormCheckbox
                    name="roleAdmin"
                    label="Admin - Full system access"
                  />
                  <FormCheckbox
                    name="roleFormCreator"
                    label="Form Creator - Can create and manage forms"
                  />
                  <FormCheckbox
                    name="roleFormViewer"
                    label="Form Viewer - Read-only access to forms"
                  />
                </div>
              </Form.Group>

              <FormCheckbox
                name="isActive"
                label="Active - User can log in"
              />
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
                  'Create User'
                )}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default CreateUserModal;
