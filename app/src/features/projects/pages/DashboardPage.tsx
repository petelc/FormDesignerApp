import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

const DashboardPage = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      <p className="lead mb-4">
        Welcome back, <strong>{user?.firstName}</strong>! 👋
      </p>

      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="h1 mb-0">0</h2>
                  <p className="text-muted mb-0">Total Projects</p>
                </div>
                <div className="fs-2">📁</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="h1 mb-0">0</h2>
                  <p className="text-muted mb-0">Completed</p>
                </div>
                <div className="fs-2">✅</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="h1 mb-0">0</h2>
                  <p className="text-muted mb-0">In Progress</p>
                </div>
                <div className="fs-2">⚙️</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h3 className="mb-3">Quick Start</h3>
          <p className="text-muted mb-4">
            Get started by creating a new project or uploading a PDF form for analysis.
          </p>
          <div className="d-flex gap-3">
            <Link to="/app/projects">
              <Button variant="primary">
                📁 View Projects
              </Button>
            </Link>
            <Button variant="outline-primary">
              📤 Upload PDF
            </Button>
          </div>
        </Card.Body>
      </Card>

      <Card className="mt-4 border-warning">
        <Card.Body className="bg-warning bg-opacity-10">
          <h5 className="mb-2">🚧 Under Development</h5>
          <p className="mb-0 text-muted">
            This is a placeholder dashboard. Full functionality will be added in upcoming phases.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DashboardPage;
