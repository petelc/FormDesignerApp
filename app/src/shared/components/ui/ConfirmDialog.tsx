import Modal from './Modal';

interface ConfirmDialogProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmVariant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  show,
  onHide,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      title={title}
      onConfirm={onConfirm}
      confirmText={confirmText}
      confirmVariant={confirmVariant}
      isLoading={isLoading}
      size="sm"
    >
      <p>{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
