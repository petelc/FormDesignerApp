import { Outlet } from 'react-router-dom';
import { Container, Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { APP_NAME, ROUTES } from '@/shared/constants';

const PublicLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header */}
      <Navbar bg="white" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to={ROUTES.HOME}>
            <strong>{APP_NAME}</strong>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="public-navbar" />
          <Navbar.Collapse id="public-navbar">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to={ROUTES.LOGIN}>
                Login
              </Nav.Link>
              <Nav.Link as={Link} to={ROUTES.REGISTER}>
                Register
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <main className="flex-grow-1 py-4">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-light py-3 mt-auto">
        <Container>
          <div className="text-center text-muted">
            <small>&copy; 2025 {APP_NAME}. All rights reserved.</small>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default PublicLayout;
