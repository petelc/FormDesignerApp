import { PageHeader, EmptyState } from '@/shared/components/ui';

const ProjectsListPage = () => {
  const handleCreateProject = () => {
    // TODO: Implement create project modal
    console.log('Create project clicked');
  };

  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Manage your form design projects"
        action={{
          label: 'New Project',
          icon: '➕',
          onClick: handleCreateProject,
        }}
      />

      <EmptyState
        icon="📁"
        title="No projects yet"
        message="Create your first project to start building forms with AI."
        actionLabel="Create Project"
        onAction={handleCreateProject}
      />
    </div>
  );
};

export default ProjectsListPage;
