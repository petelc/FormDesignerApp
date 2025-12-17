import { RouteObject } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';

// Layouts (will be created)
import PublicLayout from '@/shared/components/layout/PublicLayout';
import PrivateLayout from '@/shared/components/layout/PrivateLayout';

// Route guards (will be created)
import PrivateRoute from './PrivateRoute';
import RoleRoute from './RoleRoute';

// Pages - Auth (will be created)
import LoginPage from '@/features/auth/pages/LoginPage';
import RegisterPage from '@/features/auth/pages/RegisterPage';
import ForgotPasswordPage from '@/features/auth/pages/ForgotPasswordPage';

// Pages - App (placeholders for now)
import DashboardPage from '@/features/projects/pages/DashboardPage';
import ProjectsListPage from '@/features/projects/pages/ProjectsListPage';
import ProjectDetailPage from '@/features/projects/pages/ProjectDetailPage';
import UsersPage from '@/features/users/pages/UsersPage';
import ProfilePage from '@/features/users/pages/ProfilePage';
import UIShowcasePage from '@/shared/components/layout/UIShowcasePage';
import FormBuilderPage from '@/features/form-builder/pages/FormBuilderPage';

// Other pages
import HomePage from '@/shared/components/layout/HomePage';
import NotFoundPage from '@/shared/components/layout/NotFoundPage';

import { UserRole } from '@/shared/types';

export const routes: RouteObject[] = [
  // Public routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTES.REGISTER,
        element: <RegisterPage />,
      },
      {
        path: ROUTES.FORGOT_PASSWORD,
        element: <ForgotPasswordPage />,
      },
    ],
  },

  // Protected app routes
  {
    path: ROUTES.APP,
    element: (
      <PrivateRoute>
        <PrivateLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'projects',
        element: <ProjectsListPage />,
      },
      {
        path: 'projects/:id',
        element: <ProjectDetailPage />,
      },
      {
        path: 'form-builder',
        element: <FormBuilderPage />,
      },
      {
        path: 'form-builder/:id',
        element: <FormBuilderPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'settings',
        element: <ProfilePage />, // Can be same as profile or separate
      },
      {
        path: 'users',
        element: (
          <RoleRoute requiredRole={UserRole.ADMIN}>
            <UsersPage />
          </RoleRoute>
        ),
      },
      {
        path: 'ui-showcase',
        element: <UIShowcasePage />,
      },
    ],
  },

  // 404 Not Found
  {
    path: '*',
    element: <NotFoundPage />,
  },
];
