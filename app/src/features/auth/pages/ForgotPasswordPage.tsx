import { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { authAPI } from '../services/authAPI';
import { ROUTES } from '@/shared/constants';
import { handleApiError } from '@/shared/utils/errorHandler';

const forgotPasswordSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

const ForgotPasswordPage = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { email: string }) => {
    try {
      setError(null);
      await authAPI.forgotPassword(values);
      setSuccess(true);
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Reset Password</h2>

              {success ? (
                <Alert variant="success">
                  <Alert.Heading>Check your email!</Alert.Heading>
                  <p>
                    We've sent password reset instructions to your email address. Please check
                    your inbox and follow the link to reset your password.
                  </p>
                  <hr />
                  <div className="d-flex justify-content-end">
                    <Link to={ROUTES.LOGIN}>
                      <Button variant="outline-success">
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </Alert>
              ) : (
                <>
                  <p className="text-muted text-center mb-4">
                    Enter your email address and we'll send you instructions to reset your
                    password.
                  </p>

                  {error && <Alert variant="danger">{error}</Alert>}

                  <Formik
                    initialValues={{ email: '' }}
                    validationSchema={forgotPasswordSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                      <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.email && !!errors.email}
                            placeholder="Enter your email"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>

                        <div className="d-grid mb-3">
                          <Button type="submit" variant="primary" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                                Sending...
                              </>
                            ) : (
                              'Send Reset Instructions'
                            )}
                          </Button>
                        </div>
                      </Form>
                    )}
                  </Formik>

                  <hr className="my-4" />

                  <p className="text-center mb-0">
                    <Link to={ROUTES.LOGIN} className="text-decoration-none">
                      ← Back to Login
                    </Link>
                  </p>
                </>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ForgotPasswordPage;
