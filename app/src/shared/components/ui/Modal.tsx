import { Modal as BSModal, Button } from 'react-bootstrap';

interface ModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'lg' | 'xl';
  centered?: boolean;
  footer?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  confirmVariant?: string;
  isLoading?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  show,
  onHide,
  title,
  children,
  size,
  centered = true,
  footer,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  confirmVariant = 'primary',
  isLoading = false,
}) => {
  return (
    <BSModal show={show} onHide={onHide} size={size} centered={centered}>
      <BSModal.Header closeButton>
        <BSModal.Title>{title}</BSModal.Title>
      </BSModal.Header>
      <BSModal.Body>{children}</BSModal.Body>
      {(footer || onConfirm) && (
        <BSModal.Footer>
          {footer || (
            <>
              <Button variant="secondary" onClick={onHide} disabled={isLoading}>
                {cancelText}
              </Button>
              <Button
                variant={confirmVariant}
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Loading...
                  </>
                ) : (
                  confirmText
                )}
              </Button>
            </>
          )}
        </BSModal.Footer>
      )}
    </BSModal>
  );
};

export default Modal;
