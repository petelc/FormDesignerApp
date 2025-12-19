import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ROUTES, APP_NAME } from '@/shared/constants';

const HomePage = () => {
  return (
    <Container className="py-5">
      {/* Hero Section */}
      <Row className="align-items-center mb-5">
        <Col lg={6}>
          <h1 className="display-4 fw-bold mb-4">
            Form Designer
          </h1>
          <p className="lead mb-4">
            Transform PDF forms into production-ready code in minutes. Upload, analyze, and
            generate React components with backend APIs automatically.
          </p>
          <div className="d-flex gap-3">
            <Link to={ROUTES.REGISTER}>
              <Button variant="primary" size="lg">
                Get Started
              </Button>
            </Link>
            <Link to={ROUTES.LOGIN}>
              <Button variant="outline-primary" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </Col>
        <Col lg={6} className="mt-4 mt-lg-0">
          <div className="bg-light rounded p-5 text-center">
            <div style={{ fontSize: '4rem' }}>📄 ➜ 🤖 ➜ 💻</div>
            <p className="text-muted mt-3">PDF → Document Intelligence Analysis → Generated Code</p>
          </div>
        </Col>
      </Row>

      {/* Features */}
      <Row className="g-4 mb-5">
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div style={{ fontSize: '3rem' }} className="mb-3">
                📤
              </div>
              <Card.Title>Upload PDF Forms</Card.Title>
              <Card.Text className="text-muted">
                Drag and drop your existing PDF forms. We support all standard form types and
                layouts.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div style={{ fontSize: '3rem' }} className="mb-3">
                🤖
              </div>
              <Card.Title>AI Analysis</Card.Title>
              <Card.Text className="text-muted">
                Azure Document Intelligence extracts fields, structure, and validation rules
                automatically.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div style={{ fontSize: '3rem' }} className="mb-3">
                ⚡
              </div>
              <Card.Title>Generate Code</Card.Title>
              <Card.Text className="text-muted">
                Get production-ready React components and backend APIs with tests and
                documentation.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CTA Section */}
      <Row className="bg-primary text-white rounded p-5">
        <Col className="text-center">
          <h2 className="mb-3">Ready to accelerate your development?</h2>
          <p className="lead mb-4">
            Join developers who are building forms faster with {APP_NAME}
          </p>
          <Link to={ROUTES.REGISTER}>
            <Button variant="light" size="lg">
              Get Started
            </Button>
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default HomePage;
