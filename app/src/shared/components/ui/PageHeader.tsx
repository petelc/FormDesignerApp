import { Button } from 'react-bootstrap';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: string;
    icon?: string;
  };
  breadcrumbs?: Array<{ label: string; to?: string }>;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, action, breadcrumbs }) => {
  return (
    <div className="mb-4">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="breadcrumb" className="mb-2">
          <ol className="breadcrumb mb-0">
            {breadcrumbs.map((crumb, index) => (
              <li
                key={index}
                className={`breadcrumb-item ${index === breadcrumbs.length - 1 ? 'active' : ''}`}
                aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
              >
                {crumb.to ? (
                  <a href={crumb.to}>{crumb.label}</a>
                ) : (
                  crumb.label
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <h1 className="mb-2">{title}</h1>
          {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
        </div>
        
        {action && (
          <Button variant={action.variant || 'primary'} onClick={action.onClick}>
            {action.icon && <span className="me-2">{action.icon}</span>}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
