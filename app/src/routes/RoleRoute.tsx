import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { UserRole } from '@/shared/types';
import { ROUTES } from '@/shared/constants';

interface RoleRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole | UserRole[];
}

const RoleRoute: React.FC<RoleRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Check if user has required role
  const hasRequiredRole = Array.isArray(requiredRole)
    ? requiredRole.some((role) => user.roles.includes(role))
    : user.roles.includes(requiredRole);

  // Redirect to dashboard if user doesn't have required role
  if (!hasRequiredRole) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You do not have permission to access this page.</p>
          <hr />
          <p className="mb-0">
            Please contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleRoute;
