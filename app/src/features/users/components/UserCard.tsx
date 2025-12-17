import { Card, Badge, Dropdown } from 'react-bootstrap';
import { User } from '../types';
import { UserRole } from '@/shared/types';
import { formatDate, getInitials } from '@/shared/utils';

interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onResetPassword?: (user: User) => void;
}

const getRoleBadgeColor = (role: UserRole): string => {
  switch (role) {
    case UserRole.ADMIN:
      return 'danger';
    case UserRole.FORM_CREATOR:
      return 'primary';
    case UserRole.FORM_VIEWER:
      return 'info';
    default:
      return 'secondary';
  }
};

const UserCard: React.FC<UserCardProps> = ({
  user,
  onEdit,
  onDelete,
  onToggleStatus,
  onResetPassword,
}) => {
  return (
    <Card className="h-100 shadow-sm hover-shadow transition">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center flex-grow-1">
            {/* Avatar */}
            <div
              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
              style={{ width: '50px', height: '50px', fontSize: '1.2rem' }}
            >
              {getInitials(`${user.firstName} ${user.lastName}`)}
            </div>

            {/* User Info */}
            <div className="flex-grow-1">
              <h5 className="mb-1">
                {user.firstName} {user.lastName}
              </h5>
              <small className="text-muted">{user.email}</small>
              <div className="mt-1">
                <Badge bg={user.isActive ? 'success' : 'secondary'} className="me-1">
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions Dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="link"
              className="text-muted p-0"
              id={`dropdown-${user.id}`}
            >
              ⋮
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {onEdit && (
                <Dropdown.Item onClick={() => onEdit(user)}>
                  ✏️ Edit
                </Dropdown.Item>
              )}
              {onToggleStatus && (
                <Dropdown.Item onClick={() => onToggleStatus(user)}>
                  {user.isActive ? '🚫 Deactivate' : '✅ Activate'}
                </Dropdown.Item>
              )}
              {onResetPassword && (
                <Dropdown.Item onClick={() => onResetPassword(user)}>
                  🔑 Reset Password
                </Dropdown.Item>
              )}
              <Dropdown.Divider />
              {onDelete && (
                <Dropdown.Item
                  onClick={() => onDelete(user)}
                  className="text-danger"
                >
                  🗑️ Delete
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* Roles */}
        <div className="mb-2">
          {user.roles.map((role) => (
            <Badge
              key={role}
              bg={getRoleBadgeColor(role)}
              className="me-1"
            >
              {role}
            </Badge>
          ))}
        </div>

        {/* Metadata */}
        <div className="text-muted">
          <small>
            Created: {formatDate(user.createdAt)}
          </small>
          {user.lastLoginAt && (
            <div>
              <small>
                Last login: {formatDate(user.lastLoginAt)}
              </small>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default UserCard;
