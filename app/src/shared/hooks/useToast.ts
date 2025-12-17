import { useCallback } from 'react';
import { useAppDispatch } from '@/app/hooks';
import { addToast, removeToast } from '@/shared/components/ui/toastSlice';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export const useToast = () => {
  const dispatch = useAppDispatch();

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 5000) => {
      dispatch(
        addToast({
          message,
          type,
          duration,
        })
      );
    },
    [dispatch]
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'success', duration);
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'error', duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'warning', duration);
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      return showToast(message, 'info', duration);
    },
    [showToast]
  );

  const close = useCallback(
    (id: string) => {
      dispatch(removeToast(id));
    },
    [dispatch]
  );

  return {
    showToast,
    success,
    error,
    warning,
    info,
    close,
  };
};
