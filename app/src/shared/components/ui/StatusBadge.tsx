import { Badge } from 'react-bootstrap';

export type StatusType =
  | 'draft'
  | 'pending'
  | 'processing'
  | 'analyzing'
  | 'complete'
  | 'completed'
  | 'success'
  | 'error'
  | 'failed'
  | 'cancelled'
  | 'active'
  | 'inactive';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const getVariant = (status: StatusType): string => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'pending':
      case 'processing':
      case 'analyzing':
        return 'warning';
      case 'complete':
      case 'completed':
      case 'success':
      case 'active':
        return 'success';
      case 'error':
      case 'failed':
        return 'danger';
      case 'cancelled':
      case 'inactive':
        return 'dark';
      default:
        return 'secondary';
    }
  };

  const getLabel = (status: StatusType): string => {
    if (label) return label;
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <Badge bg={getVariant(status)} className="text-uppercase">
      {getLabel(status)}
    </Badge>
  );
};

export default StatusBadge;
