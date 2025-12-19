import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useToast, useDebounce } from '@/shared/hooks';
import {
  fetchProjects,
  createProject,
  deleteProject,
  clearError,
} from '../slices/projectsSlice';
import { ProjectStatus, ProjectFilters } from '../types';
import CreateProjectModal from '../components/CreateProjectModal';
import ProjectCard from '../components/ProjectCard';
import { LoadingSpinner, EmptyState, ConfirmDialog } from '@/shared/components/ui';

const ProjectsListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { items, isLoading, error, pagination } = useAppSelector(
    (state) => state.projects
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Load projects on mount and when filters change
  useEffect(() => {
    const activeFilters: ProjectFilters = {};
    
    if (debouncedSearch) {
      activeFilters.search = debouncedSearch;
    }
    
    if (statusFilter) {
      activeFilters.status = statusFilter;
    }
    
    dispatch(fetchProjects({ 
      pagination: { page: 1, pageSize: 10 },
      filters: Object.keys(activeFilters).length > 0 ? activeFilters : undefined,
    }));
  }, [dispatch, debouncedSearch, statusFilter]);

  

  const handleCreateProject = async (values: { name: string; description: string }) => {
    const result = await dispatch(createProject(values));
    
    if (createProject.fulfilled.match(result)) {
      toast.success('Project created successfully!');
      setShowCreateModal(false);
      
      // Navigate to the new project
      navigate(`/app/projects/${result.payload.id}`);
    } else {
      toast.error('Failed to create project');
    }
  };

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    const result = await dispatch(deleteProject(projectToDelete));
    
    if (deleteProject.fulfilled.match(result)) {
      toast.success('Project deleted successfully');
      setShowDeleteDialog(false);
      setProjectToDelete(null);
    } else {
      toast.error('Failed to delete project');
    }
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status as ProjectStatus | '');
  };

  // Safety check for items array
  const projects = items || [];

  if (isLoading && projects.length === 0) {
    return <LoadingSpinner fullScreen message="Loading projects..." />;
  }

  console.log(projects);


  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Projects</h1>
          <p className="text-muted mb-0">
            Manage your form development projects
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          ➕ New Project
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={8}>
              <InputGroup>
                <InputGroup.Text>🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value={ProjectStatus.DRAFT}>Draft</option>
                <option value={ProjectStatus.PDF_UPLOADED}>PDF Uploaded</option>
                <option value={ProjectStatus.ANALYZING}>Analyzing</option>
                <option value={ProjectStatus.ANALYSIS_COMPLETE}>Analysis Complete</option>
                <option value={ProjectStatus.CODE_GENERATED}>Code Generated</option>
                <option value={ProjectStatus.COMPLETED}>Completed</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No projects yet"
          message="Create your first project to start building forms with AI."
          actionLabel="Create Project"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <>
          <Row className="g-4">
            {projects.map((project) => (
              <Col key={project.id} md={6} lg={4}>
                <ProjectCard
                  project={project}
                  onDelete={(p) => handleDeleteClick(p.id)}
                />
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <p className="text-muted">
                Showing {projects.length} of {pagination.total} projects
              </p>
            </div>
          )}
        </>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        show={showCreateModal}
        onHide={() => {
          setShowCreateModal(false);
          dispatch(clearError());
        }}
        onSubmit={handleCreateProject}
        isLoading={isLoading}
        error={error}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        show={showDeleteDialog}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        onHide={() => {
          setShowDeleteDialog(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default ProjectsListPage;
