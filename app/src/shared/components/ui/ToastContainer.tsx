import { useEffect } from 'react';
import { Toast, ToastContainer as BSToastContainer } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { removeToast } from './toastSlice';

const ToastContainer = () => {
  const dispatch = useAppDispatch();
  const { toasts } = useAppSelector((state) => state.toast);

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration) {
        const timer = setTimeout(() => {
          dispatch(removeToast(toast.id));
        }, toast.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [toasts, dispatch]);

  const getBgVariant = (type: string) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'primary';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📢';
    }
  };

  return (
    <BSToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          onClose={() => dispatch(removeToast(toast.id))}
          bg={getBgVariant(toast.type)}
          autohide
          delay={toast.duration}
        >
          <Toast.Header>
            <span className="me-2">{getIcon(toast.type)}</span>
            <strong className="me-auto">
              {toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}
            </strong>
          </Toast.Header>
          <Toast.Body className={toast.type === 'error' || toast.type === 'warning' ? '' : 'text-white'}>
            {toast.message}
          </Toast.Body>
        </Toast>
      ))}
    </BSToastContainer>
  );
};

export default ToastContainer;
