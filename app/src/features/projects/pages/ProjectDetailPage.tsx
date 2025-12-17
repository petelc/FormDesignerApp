import { useParams } from 'react-router-dom';
import { Card } from 'react-bootstrap';

const ProjectDetailPage = () => {
  const { id } = useParams();

  return (
    <div>
      <h1 className="mb-4">Project Details</h1>
      <Card className="shadow-sm">
        <Card.Body>
          <p className="text-muted">Project ID: {id}</p>
          <p>This page will show project details and workflow steps.</p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProjectDetailPage;
