import { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useToast, useDebounce } from '@/shared/hooks';
import {
  fetchUsers,
  createUser,
  deleteUser,
  toggleUserStatus,
  clearError,
} from '../slices/usersSlice';
import { UserRole } from '@/shared/types';
import CreateUserModal from '../components/CreateUserModal';
import UserCard from '../components/UserCard';
import { LoadingSpinner, EmptyState, ConfirmDialog } from '@/shared/components/ui';
import { usersAPI } from '../services/usersAPI';

const UsersPage = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  
  const { items, isLoading, error, pagination } = useAppSelector(
    (state) => state.users
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Load users on mount and when filters change
  useEffect(() => {
    dispatch(fetchUsers({ 
      pagination: { page: 1, pageSize: 20 },
      filters: {
        search: debouncedSearch || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      }
    }));
  }, [dispatch, debouncedSearch, roleFilter, statusFilter]);

  const handleCreateUser = async (values: any) => {
    const result = await dispatch(createUser(values));
    
    if (createUser.fulfilled.match(result)) {
      toast.success('User created successfully!');
      setShowCreateModal(false);
    } else {
      toast.error('Failed to create user');
    }
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    const result = await dispatch(deleteUser(userToDelete));
    
    if (deleteUser.fulfilled.match(result)) {
      toast.success('User deleted successfully');
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } else {
      toast.error('Failed to delete user');
    }
  };

  const handleToggleStatus = async (user: any) => {
    const result = await dispatch(toggleUserStatus(user.id));
    
    if (toggleUserStatus.fulfilled.match(result)) {
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
    } else {
      toast.error('Failed to update user status');
    }
  };

  const handleResetPassword = async (user: any) => {
    try {
      const result = await usersAPI.resetPassword(user.id);
      toast.success(`Password reset! Temporary password: ${result.temporaryPassword}`);
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  if (isLoading && items.length === 0) {
    return <LoadingSpinner fullScreen message="Loading users..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">User Management</h1>
          <p className="text-muted mb-0">
            Manage user accounts and permissions
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          ➕ Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
              >
                <option value="">All Roles</option>
                <option value={UserRole.ADMIN}>Admin</option>
                <option value={UserRole.FORM_CREATOR}>Form Creator</option>
                <option value={UserRole.FORM_VIEWER}>Form Viewer</option>
                <option value={UserRole.USER}>User</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Users Grid */}
      {items.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No users found"
          message={searchTerm || roleFilter || statusFilter !== 'all' 
            ? "Try adjusting your filters" 
            : "Add your first user to get started."}
          actionLabel="Add User"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <>
          <Row className="g-4">
            {items.map((user) => (
              <Col key={user.id} md={6} lg={4}>
                <UserCard
                  user={user}
                  onDelete={(u) => handleDeleteClick(u.id)}
                  onToggleStatus={handleToggleStatus}
                  onResetPassword={handleResetPassword}
                />
              </Col>
            ))}
          </Row>

          {/* Pagination Info */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <p className="text-muted">
                Showing {items.length} of {pagination.total} users
              </p>
            </div>
          )}
        </>
      )}

      {/* Create User Modal */}
      <CreateUserModal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false);
          dispatch(clearError());
        }}
        onSubmit={handleCreateUser}
        isLoading={isLoading}
        error={error}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        show={showDeleteDialog}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone and will remove all associated data."
        confirmText="Delete"
        confirmVariant="danger"
        onHide={() => {
          setShowDeleteDialog(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default UsersPage;
