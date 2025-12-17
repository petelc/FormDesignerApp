import { useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '@/shared/hooks';
import { ROUTES } from '@/shared/constants';

const loginSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  rememberMe: Yup.boolean(),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, error, login } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values: { email: string; password: string; rememberMe: boolean }) => {
    await login(values);
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Sign In</h2>

              {error && (
                <Alert variant="danger">
                  {error}
                </Alert>
              )}

              <Formik
                initialValues={{ email: '', password: '', rememberMe: false }}
                validationSchema={loginSchema}
                onSubmit={handleSubmit}
              >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
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
                      <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.password && !!errors.password}
                        placeholder="Enter your password"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.password}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        name="rememberMe"
                        label="Remember me"
                        checked={values.rememberMe}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <div className="d-grid mb-3">
                      <Button type="submit" variant="primary" size="lg" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Signing in...
                          </>
                        ) : (
                          'Sign In'
                        )}
                      </Button>
                    </div>

                    <div className="text-center">
                      <Link to={ROUTES.FORGOT_PASSWORD} className="text-decoration-none">
                        Forgot password?
                      </Link>
                    </div>
                  </Form>
                )}
              </Formik>

              <hr className="my-4" />

              <p className="text-center mb-0">
                Don't have an account?{' '}
                <Link to={ROUTES.REGISTER} className="text-decoration-none">
                  Sign up
                </Link>
              </p>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default LoginPage;
