import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/slices/authSlice';
import toastReducer from '@/shared/components/ui/toastSlice';
import projectsReducer from '@/features/projects/slices/projectsSlice';
import usersReducer from '@/features/users/slices/usersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    projects: projectsReducer,
    users: usersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
