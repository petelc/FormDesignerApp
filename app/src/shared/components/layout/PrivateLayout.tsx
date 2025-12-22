import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Nav, Dropdown, Offcanvas } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logoutUser } from '@/features/auth/slices/authSlice';
import { APP_NAME, ROUTES } from '@/shared/constants';
import { UserRole } from '@/shared/types';

const PrivateLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const [showSidebar, setShowSidebar] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate(ROUTES.LOGIN);
  };

  const isAdmin = user?.roles.includes(UserRole.ADMIN);

  const navItems = [
    { to: '/app/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/app/projects', label: 'Projects', icon: '📁' },
    { to: '/app/form-builder', label: 'Form Builder', icon: '🛠️' },
    { to: '/app/ui-showcase', label: 'UI Showcase', icon: '🎨' },
  ];

  if (isAdmin) {
    navItems.push({ to: '/app/users', label: 'Users', icon: '👥' });
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Top Navigation */}
      <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
        <Container fluid>
          <button
            className="btn btn-link text-white d-lg-none"
            onClick={() => setShowSidebar(true)}
          >
            ☰
          </button>
          <Navbar.Brand as={Link} to={ROUTES.DASHBOARD}>
            <strong>{APP_NAME}</strong>
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" className="text-white text-decoration-none">
                👤 {user?.firstName} {user?.lastName}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item disabled>
                  {user?.email}
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/app/profile">
                  Profile
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/app/settings">
                  Settings
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav>
        </Container>
      </Navbar>

      <div className="d-flex flex-grow-1">
        {/* Sidebar for desktop */}
        <div className="d-none d-lg-block bg-light border-end" style={{ width: '250px' }}>
          <Nav className="flex-column p-3">
            {navItems.map((item) => (
              <Nav.Link
                key={item.to}
                as={Link}
                to={item.to}
                className="py-2 px-3 rounded mb-1"
              >
                <span className="me-2">{item.icon}</span>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </div>

        {/* Offcanvas sidebar for mobile */}
        <Offcanvas
          show={showSidebar}
          onHide={() => setShowSidebar(false)}
          placement="start"
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>{APP_NAME}</Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            <Nav className="flex-column">
              {navItems.map((item) => (
                <Nav.Link
                  key={item.to}
                  as={Link}
                  to={item.to}
                  onClick={() => setShowSidebar(false)}
                  className="py-2 px-3 rounded mb-1"
                >
                  <span className="me-2">{item.icon}</span>
                  {item.label}
                </Nav.Link>
              ))}
            </Nav>
          </Offcanvas.Body>
        </Offcanvas>

        {/* Main Content */}
        <main className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa' }}>
          <Container fluid>
            <Outlet />
          </Container>
        </main>
      </div>
    </div>
  );
};

export default PrivateLayout;
