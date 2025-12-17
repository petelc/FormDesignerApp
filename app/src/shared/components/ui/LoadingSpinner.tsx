import { Spinner } from 'react-bootstrap';

interface LoadingSpinnerProps {
  size?: 'sm';
  variant?: string;
  fullScreen?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size,
  variant = 'primary',
  fullScreen = false,
  message,
}) => {
  if (fullScreen) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant={variant} role="status" size={size}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        {message && <p className="mt-3 text-muted">{message}</p>}
      </div>
    );
  }

  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <Spinner animation="border" variant={variant} role="status" size={size}>
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      {message && <p className="mt-3 text-muted">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
