import { useState } from 'react';
import { Card, Button, Nav, Badge, Alert } from 'react-bootstrap';
import { GeneratedCode, GeneratedFile } from '../types';

interface CodeViewerProps {
  generatedCode: GeneratedCode;
  onDownload: () => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ generatedCode, onDownload }) => {
  const [selectedFile, setSelectedFile] = useState<GeneratedFile>(generatedCode.files[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageIcon = (language: string): string => {
    switch (language) {
      case 'typescript':
        return '📘';
      case 'javascript':
        return '📙';
      case 'json':
        return '📦';
      case 'markdown':
        return '📝';
      default:
        return '📄';
    }
  };

  const getFileIcon = (fileName: string): string => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) return '⚛️';
    if (fileName.endsWith('.ts') || fileName.endsWith('.js')) return '📜';
    if (fileName.endsWith('.json')) return '📦';
    if (fileName.endsWith('.md')) return '📝';
    if (fileName.endsWith('.css') || fileName.endsWith('.scss')) return '🎨';
    return '📄';
  };

  return (
    <div>
      {/* Summary */}
      <Alert variant="success" className="d-flex justify-content-between align-items-center">
        <div>
          <strong>✅ Code Generated Successfully!</strong>
          <div className="mt-1">
            <small>
              {generatedCode.files.length} files generated •{' '}
              {new Date(generatedCode.metadata.generatedAt).toLocaleString()}
            </small>
          </div>
        </div>
        <Button variant="success" onClick={onDownload}>
          ⬇️ Download ZIP
        </Button>
      </Alert>

      <Card className="shadow-sm">
        <Card.Body>
          <div className="row">
            {/* File Tree */}
            <div className="col-md-3 border-end">
              <h6 className="mb-3">Files</h6>
              <Nav className="flex-column">
                {generatedCode.files.map((file, index) => (
                  <Nav.Link
                    key={index}
                    active={selectedFile === file}
                    onClick={() => setSelectedFile(file)}
                    className="d-flex align-items-center text-start"
                  >
                    <span className="me-2">{getFileIcon(file.name)}</span>
                    <span className="text-truncate">{file.name}</span>
                  </Nav.Link>
                ))}
              </Nav>

              {/* File Structure Summary */}
              <div className="mt-4">
                <h6 className="mb-2">Structure</h6>
                {generatedCode.structure.frontend.length > 0 && (
                  <div className="mb-2">
                    <Badge bg="primary">
                      {generatedCode.structure.frontend.length} Frontend
                    </Badge>
                  </div>
                )}
                {generatedCode.structure.backend.length > 0 && (
                  <div className="mb-2">
                    <Badge bg="success">
                      {generatedCode.structure.backend.length} Backend
                    </Badge>
                  </div>
                )}
                {generatedCode.structure.tests.length > 0 && (
                  <div className="mb-2">
                    <Badge bg="warning">
                      {generatedCode.structure.tests.length} Tests
                    </Badge>
                  </div>
                )}
                {generatedCode.structure.docs.length > 0 && (
                  <div className="mb-2">
                    <Badge bg="info">
                      {generatedCode.structure.docs.length} Docs
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Code Display */}
            <div className="col-md-9">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <span className="me-2" style={{ fontSize: '1.5rem' }}>
                    {getLanguageIcon(selectedFile.language)}
                  </span>
                  <div>
                    <h6 className="mb-0">{selectedFile.name}</h6>
                    <small className="text-muted">{selectedFile.path || 'Root'}</small>
                  </div>
                </div>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </Button>
              </div>

              <div
                style={{
                  backgroundColor: '#f5f5f5',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '1rem',
                  maxHeight: '600px',
                  overflow: 'auto',
                }}
              >
                <pre style={{ margin: 0, fontSize: '0.85rem' }}>
                  <code>{selectedFile.content}</code>
                </pre>
              </div>

              <div className="mt-3">
                <small className="text-muted">
                  💡 Tip: Click "Download ZIP" to get all files packaged together
                </small>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CodeViewer;
