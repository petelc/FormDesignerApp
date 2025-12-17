import { Card, Badge, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FormProject, ProjectStatus } from '../types';
import { formatDate, getRelativeTime } from '@/shared/utils';

interface ProjectCardProps {
  project: FormProject;
  onEdit?: (project: FormProject) => void;
  onDelete?: (project: FormProject) => void;
}

const getStatusColor = (status: ProjectStatus): string => {
  switch (status) {
    case ProjectStatus.DRAFT:
      return 'secondary';
    case ProjectStatus.PDF_UPLOADED:
      return 'info';
    case ProjectStatus.ANALYZING:
      return 'warning';
    case ProjectStatus.ANALYSIS_COMPLETE:
      return 'success';
    case ProjectStatus.STRUCTURE_REVIEWED:
      return 'primary';
    case ProjectStatus.GENERATING_CODE:
      return 'warning';
    case ProjectStatus.CODE_GENERATED:
      return 'success';
    case ProjectStatus.COMPLETED:
      return 'success';
    case ProjectStatus.FAILED:
      return 'danger';
    default:
      return 'secondary';
  }
};

const getStatusLabel = (status: ProjectStatus): string => {
  return status.split('_').map(word => 
    word.charAt(0) + word.slice(1).toLowerCase()
  ).join(' ');
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete }) => {
  return (
    <Card className="h-100 shadow-sm hover-shadow transition">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="flex-grow-1">
            <Link
              to={`/app/projects/${project.id}`}
              className="text-decoration-none text-dark"
            >
              <h5 className="mb-1">{project.name}</h5>
            </Link>
            <Badge bg={getStatusColor(project.status)} className="mb-2">
              {getStatusLabel(project.status)}
            </Badge>
          </div>

          <Dropdown align="end">
            <Dropdown.Toggle variant="link" className="text-muted p-0" id={`dropdown-${project.id}`}>
              ⋮
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {onEdit && (
                <Dropdown.Item onClick={() => onEdit(project)}>
                  ✏️ Edit
                </Dropdown.Item>
              )}
              <Dropdown.Item as={Link} to={`/app/projects/${project.id}`}>
                👁️ View Details
              </Dropdown.Item>
              <Dropdown.Divider />
              {onDelete && (
                <Dropdown.Item
                  onClick={() => onDelete(project)}
                  className="text-danger"
                >
                  🗑️ Delete
                </Dropdown.Item>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
          {project.description.length > 100
            ? `${project.description.substring(0, 100)}...`
            : project.description}
        </p>

        {project.originalPdfFileName && (
          <div className="mb-2">
            <small className="text-muted">
              📄 {project.originalPdfFileName}
            </small>
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center text-muted">
          <small>Created {getRelativeTime(project.createdAt)}</small>
          <small>{formatDate(project.createdAt)}</small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectCard;
