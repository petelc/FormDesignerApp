import { Card, Button } from 'react-bootstrap';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionVariant?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  message,
  actionLabel,
  onAction,
  actionVariant = 'primary',
}) => {
  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="text-center py-5">
        <div style={{ fontSize: '4rem' }} className="mb-3">
          {icon}
        </div>
        <h3 className="mb-3">{title}</h3>
        <p className="text-muted mb-4">{message}</p>
        {actionLabel && onAction && (
          <Button variant={actionVariant} onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </Card.Body>
    </Card>
  );
};

export default EmptyState;
