import { useState } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import {
  LoadingSpinner,
  Modal,
  ConfirmDialog,
  EmptyState,
  DataTable,
  StatusBadge,
  PageHeader,
  addToast,
} from '@/shared/components/ui';
import type { Column } from '@/shared/components/ui/DataTable';
import { useAppDispatch } from '@/app/hooks';

interface SampleData {
  id: string;
  name: string;
  status: 'draft' | 'processing' | 'complete';
  date: string;
}

const UIShowcasePage = () => {
  const dispatch = useAppDispatch();
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const sampleData: SampleData[] = [
    { id: '1', name: 'Project Alpha', status: 'complete', date: '2025-01-15' },
    { id: '2', name: 'Project Beta', status: 'processing', date: '2025-01-14' },
    { id: '3', name: 'Project Gamma', status: 'draft', date: '2025-01-13' },
  ];

  const columns: Column<SampleData>[] = [
    { key: 'name', label: 'Name', sortable: true },
    {
      key: 'status',
      label: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    { key: 'date', label: 'Date', sortable: true },
  ];

  const handleToast = (type: 'success' | 'error' | 'warning' | 'info') => {
    dispatch(
      addToast({
        message: `This is a ${type} toast notification!`,
        type,
      })
    );
  };

  return (
    <div>
      <PageHeader
        title="UI Component Showcase"
        subtitle="Preview of all available UI components"
      />

      {/* Buttons & Toasts */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Toast Notifications</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex gap-2 flex-wrap">
            <Button variant="success" onClick={() => handleToast('success')}>
              Success Toast
            </Button>
            <Button variant="danger" onClick={() => handleToast('error')}>
              Error Toast
            </Button>
            <Button variant="warning" onClick={() => handleToast('warning')}>
              Warning Toast
            </Button>
            <Button variant="info" onClick={() => handleToast('info')}>
              Info Toast
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Modals */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Modals & Dialogs</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Open Modal
            </Button>
            <Button variant="danger" onClick={() => setShowConfirm(true)}>
              Open Confirm Dialog
            </Button>
          </div>

          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            title="Example Modal"
            confirmText="Save Changes"
            onConfirm={() => {
              handleToast('success');
              setShowModal(false);
            }}
          >
            <p>This is an example modal with customizable content.</p>
            <p>You can add any React components here.</p>
          </Modal>

          <ConfirmDialog
            show={showConfirm}
            onHide={() => setShowConfirm(false)}
            onConfirm={() => {
              handleToast('success');
              setShowConfirm(false);
            }}
            title="Confirm Action"
            message="Are you sure you want to proceed with this action?"
            confirmText="Yes, Continue"
            confirmVariant="danger"
          />
        </Card.Body>
      </Card>

      {/* Status Badges */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Status Badges</h5>
        </Card.Header>
        <Card.Body>
          <div className="d-flex gap-2 flex-wrap">
            <StatusBadge status="draft" />
            <StatusBadge status="pending" />
            <StatusBadge status="processing" />
            <StatusBadge status="complete" />
            <StatusBadge status="success" />
            <StatusBadge status="error" />
            <StatusBadge status="failed" />
            <StatusBadge status="active" />
            <StatusBadge status="inactive" />
          </div>
        </Card.Body>
      </Card>

      {/* Loading Spinner */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Loading Spinner</h5>
        </Card.Header>
        <Card.Body>
          <Button
            variant="primary"
            onClick={() => {
              setShowLoading(true);
              setTimeout(() => setShowLoading(false), 2000);
            }}
          >
            Show Loading (2s)
          </Button>
          {showLoading && <LoadingSpinner message="Loading data..." />}
        </Card.Body>
      </Card>

      {/* Empty State */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Empty State</h5>
        </Card.Header>
        <Card.Body>
          <EmptyState
            icon="📦"
            title="No Items Found"
            message="There are no items to display at this time."
            actionLabel="Add Item"
            onAction={() => handleToast('info')}
          />
        </Card.Body>
      </Card>

      {/* Data Table */}
      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">Data Table</h5>
        </Card.Header>
        <Card.Body>
          <DataTable
            data={sampleData}
            columns={columns}
            keyExtractor={(item) => item.id}
            striped
            hover
          />
        </Card.Body>
      </Card>

      {/* Grid Layout Example */}
      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <h5>Card 1</h5>
              <p className="text-muted">Example card content</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <h5>Card 2</h5>
              <p className="text-muted">Example card content</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <h5>Card 3</h5>
              <p className="text-muted">Example card content</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UIShowcasePage;
