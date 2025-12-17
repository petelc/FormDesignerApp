import { useEffect } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { fetchProjects } from '../slices/projectsSlice';
import { ProjectStatus } from '../types';
import { LoadingSpinner } from '@/shared/components/ui';

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { items, isLoading } = useAppSelector((state) => state.projects);

  useEffect(() => {
    dispatch(fetchProjects({ pagination: { page: 1, pageSize: 100 } }));
  }, [dispatch]);

  // Calculate statistics
  const totalProjects = items.length;
  const completedProjects = items.filter(
    (p) => p.status === ProjectStatus.COMPLETED || p.status === ProjectStatus.CODE_GENERATED
  ).length;
  const inProgressProjects = items.filter(
    (p) =>
      p.status === ProjectStatus.ANALYZING ||
      p.status === ProjectStatus.GENERATING_CODE ||
      p.status === ProjectStatus.STRUCTURE_REVIEWED
  ).length;
  const draftProjects = items.filter((p) => p.status === ProjectStatus.DRAFT).length;

  if (isLoading && items.length === 0) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      <p className="lead mb-4">
        Welcome back, <strong>{user?.firstName}</strong>! 👋
      </p>

      <Row className="g-4 mb-4">
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="h1 mb-0">{totalProjects}</h2>
                  <p className="text-muted mb-0">Total Projects</p>
                </div>
                <div className="fs-2">📁</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="h1 mb-0">{completedProjects}</h2>
                  <p className="text-muted mb-0">Completed</p>
                </div>
                <div className="fs-2">✅</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="h1 mb-0">{inProgressProjects}</h2>
                  <p className="text-muted mb-0">In Progress</p>
                </div>
                <div className="fs-2">⚙️</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="h1 mb-0">{draftProjects}</h2>
                  <p className="text-muted mb-0">Drafts</p>
                </div>
                <div className="fs-2">📝</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h3 className="mb-3">Quick Start</h3>
              <p className="text-muted mb-4">
                Get started by creating a new project or uploading a PDF form for analysis.
              </p>
              <div className="d-flex gap-3">
                <Link to="/app/projects">
                  <Button variant="primary">📁 View All Projects</Button>
                </Link>
                <Link to="/app/projects">
                  <Button variant="outline-primary">➕ New Project</Button>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="shadow-sm h-100">
            <Card.Body className="p-4">
              <h3 className="mb-3">Recent Activity</h3>
              {items.length === 0 ? (
                <p className="text-muted">No activity yet</p>
              ) : (
                <div>
                  {items.slice(0, 3).map((project) => (
                    <div key={project.id} className="mb-3 pb-3 border-bottom">
                      <Link
                        to={`/app/projects/${project.id}`}
                        className="text-decoration-none text-dark"
                      >
                        <div className="fw-bold">{project.name}</div>
                        <small className="text-muted">
                          {project.status.split('_').map(word => 
                            word.charAt(0) + word.slice(1).toLowerCase()
                          ).join(' ')}
                        </small>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
