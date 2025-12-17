import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/slices/authSlice';
import toastReducer from '@/shared/components/ui/toastSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    // Add more reducers here as they are created
    // projects: projectsReducer,
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
