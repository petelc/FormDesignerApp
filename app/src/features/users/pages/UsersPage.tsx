import { Card, Button } from 'react-bootstrap';

const UsersPage = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>User Management</h1>
        <Button variant="primary">
          ➕ Add User
        </Button>
      </div>

      <Card className="shadow-sm">
        <Card.Body>
          <p className="text-muted">
            User management interface will be implemented here.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default UsersPage;
