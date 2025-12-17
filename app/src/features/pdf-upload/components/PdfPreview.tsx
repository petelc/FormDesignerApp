import { useState } from 'react';
import { Card, Button } from 'react-bootstrap';

interface PdfPreviewProps {
  pdfUrl: string;
  fileName?: string;
  onRemove?: () => void;
}

const PdfPreview: React.FC<PdfPreviewProps> = ({
  pdfUrl,
  fileName,
  onRemove,
}) => {
  const [showFullscreen, setShowFullscreen] = useState(false);

  return (
    <>
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center">
            <span className="me-2">📄</span>
            <strong>{fileName || 'PDF Preview'}</strong>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowFullscreen(true)}
            >
              🔍 View Full
            </Button>
            <a
              href={pdfUrl}
              download={fileName}
              className="btn btn-outline-primary btn-sm"
            >
              ⬇️ Download
            </a>
            {onRemove && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={onRemove}
              >
                🗑️ Remove
              </Button>
            )}
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <iframe
            src={pdfUrl}
            style={{
              width: '100%',
              height: '500px',
              border: 'none',
            }}
            title="PDF Preview"
          />
        </Card.Body>
      </Card>

      {/* Fullscreen Modal */}
      {showFullscreen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={() => setShowFullscreen(false)}
        >
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span className="text-white">{fileName}</span>
            <Button
              variant="light"
              size="sm"
              onClick={() => setShowFullscreen(false)}
            >
              ✕ Close
            </Button>
          </div>
          <iframe
            src={pdfUrl}
            style={{
              width: '100%',
              height: 'calc(100% - 60px)',
              border: 'none',
            }}
            title="PDF Fullscreen"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default PdfPreview;
