import { useState } from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAppSelector } from '@/app/hooks';
import { useToast } from '@/shared/hooks';
import { FormInput } from '@/shared/components/forms';
import { getInitials, formatDate } from '@/shared/utils';
import { usersAPI } from '@/features/users/services/usersAPI';

const profileSchema = Yup.object({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'Must be at least 2 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Please confirm your password'),
});

const ProfilePage = () => {
  const { user } = useAppSelector((state) => state.auth);
  const toast = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  if (!user) {
    return null;
  }

  const handleUpdateProfile = async (values: any) => {
    try {
      await usersAPI.updateUser(user.id, {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
      });
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
      // Note: In production, you'd also update the auth state
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleChangePassword = async (values: any) => {
    try {
      await usersAPI.changePassword(user.id, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      toast.success('Password changed successfully!');
      setIsChangingPassword(false);
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  return (
    <div>
      <h1 className="mb-4">My Profile</h1>

      <Row>
        <Col lg={4}>
          {/* Profile Card */}
          <Card className="shadow-sm mb-4">
            <Card.Body className="text-center">
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: '100px', height: '100px', fontSize: '2rem' }}
              >
                {getInitials(`${user.firstName} ${user.lastName}`)}
              </div>
              <h3 className="mb-1">
                {user.firstName} {user.lastName}
              </h3>
              <p className="text-muted mb-3">{user.email}</p>
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                {user.roles.map((role) => (
                  <span key={role} className="badge bg-primary">
                    {role}
                  </span>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Account Info */}
          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-3">Account Information</h5>
              <div className="mb-2">
                <small className="text-muted">Member Since</small>
                <div>{formatDate(user.createdAt)}</div>
              </div>
              {user.lastLoginAt && (
                <div className="mb-2">
                  <small className="text-muted">Last Login</small>
                  <div>{formatDate(user.lastLoginAt)}</div>
                </div>
              )}
              <div>
                <small className="text-muted">Account Status</small>
                <div>
                  <span className={`badge bg-${user.isActive ? 'success' : 'secondary'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          {/* Edit Profile */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Profile Details</h5>
              {!isEditingProfile && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                >
                  ✏️ Edit
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {isEditingProfile ? (
                <Formik
                  initialValues={{
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                  }}
                  validationSchema={profileSchema}
                  onSubmit={handleUpdateProfile}
                >
                  {({ handleSubmit, isSubmitting }) => (
                    <Form onSubmit={handleSubmit}>
                      <Row>
                        <Col md={6}>
                          <FormInput name="firstName" label="First Name" />
                        </Col>
                        <Col md={6}>
                          <FormInput name="lastName" label="Last Name" />
                        </Col>
                      </Row>
                      <FormInput name="email" label="Email Address" type="email" />

                      <div className="d-flex gap-2">
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setIsEditingProfile(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              ) : (
                <div>
                  <Row>
                    <Col md={6} className="mb-3">
                      <small className="text-muted">First Name</small>
                      <div>{user.firstName}</div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <small className="text-muted">Last Name</small>
                      <div>{user.lastName}</div>
                    </Col>
                  </Row>
                  <div>
                    <small className="text-muted">Email Address</small>
                    <div>{user.email}</div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Change Password */}
          <Card className="shadow-sm">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Security</h5>
              {!isChangingPassword && (
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => setIsChangingPassword(true)}
                >
                  🔑 Change Password
                </Button>
              )}
            </Card.Header>
            <Card.Body>
              {isChangingPassword ? (
                <Formik
                  initialValues={{
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  }}
                  validationSchema={passwordSchema}
                  onSubmit={handleChangePassword}
                >
                  {({ handleSubmit, isSubmitting }) => (
                    <Form onSubmit={handleSubmit}>
                      <FormInput
                        name="currentPassword"
                        label="Current Password"
                        type="password"
                      />
                      <FormInput
                        name="newPassword"
                        label="New Password"
                        type="password"
                        helpText="Must be 8+ characters with uppercase, lowercase, and number"
                      />
                      <FormInput
                        name="confirmPassword"
                        label="Confirm New Password"
                        type="password"
                      />

                      <div className="d-flex gap-2">
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                          {isSubmitting ? 'Changing...' : 'Change Password'}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setIsChangingPassword(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </Form>
                  )}
                </Formik>
              ) : (
                <div>
                  <p className="text-muted mb-0">
                    Keep your account secure by using a strong password and changing it
                    regularly.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ProfilePage;
