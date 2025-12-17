import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { loginUser, registerUser, logoutUser } from '@/features/auth/slices/authSlice';
import { LoginRequest, RegisterRequest } from '@/features/auth/types';
import { UserRole } from '@/shared/types';
import { ROUTES } from '@/shared/constants';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const result = await dispatch(loginUser(credentials));
      if (loginUser.fulfilled.match(result)) {
        navigate(ROUTES.DASHBOARD);
        return { success: true };
      }
      return { success: false, error: result.payload as string };
    },
    [dispatch, navigate]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const result = await dispatch(registerUser(data));
      if (registerUser.fulfilled.match(result)) {
        navigate(ROUTES.DASHBOARD);
        return { success: true };
      }
      return { success: false, error: result.payload as string };
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
    navigate(ROUTES.LOGIN);
  }, [dispatch, navigate]);

  const hasRole = useCallback(
    (role: UserRole): boolean => {
      return user?.roles.includes(role) ?? false;
    },
    [user]
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]): boolean => {
      return roles.some((role) => user?.roles.includes(role)) ?? false;
    },
    [user]
  );

  const hasAllRoles = useCallback(
    (roles: UserRole[]): boolean => {
      return roles.every((role) => user?.roles.includes(role)) ?? false;
    },
    [user]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
};
