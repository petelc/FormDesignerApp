import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/constants';

const NotFoundPage = () => {
  return (
    <Container className="text-center py-5">
      <div style={{ fontSize: '8rem' }}>🔍</div>
      <h1 className="display-4 mb-3">404 - Page Not Found</h1>
      <p className="lead text-muted mb-4">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to={ROUTES.HOME}>
        <Button variant="primary">
          Go Home
        </Button>
      </Link>
    </Container>
  );
};

export default NotFoundPage;
