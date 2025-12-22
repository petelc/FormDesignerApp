import { useState, useMemo } from 'react';
import { Card, Button, Nav, Badge, Alert } from 'react-bootstrap';
import { ProjectCodeGenerationResponse, GeneratedCodeFile } from '../types';

interface CodeViewerProps {
  generatedCode: ProjectCodeGenerationResponse;
  onDownload: () => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ generatedCode, onDownload }) => {
  // Flatten all files from categories into a single array
  const allFiles = useMemo(() => {
    const files: Array<GeneratedCodeFile & { category: string }> = [];
    
    Object.entries(generatedCode.files).forEach(([category, categoryFiles]) => {
      categoryFiles.forEach(file => {
        files.push({ ...file, category });
      });
    });
    
    return files;
  }, [generatedCode.files]);

  const [selectedFile, setSelectedFile] = useState<GeneratedCodeFile & { category: string }>(
    allFiles[0]
  );
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageIcon = (language: string): string => {
    switch (language.toLowerCase()) {
      case 'typescript':
      case 'tsx':
        return '📘';
      case 'javascript':
      case 'jsx':
        return '📙';
      case 'csharp':
      case 'cs':
        return '🔷';
      case 'sql':
        return '🗄️';
      case 'json':
        return '📦';
      case 'yaml':
      case 'yml':
        return '📋';
      case 'markdown':
      case 'md':
        return '📝';
      default:
        return '📄';
    }
  };

  const getFileIcon = (fileName: string): string => {
    if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) return '⚛️';
    if (fileName.endsWith('.ts') || fileName.endsWith('.js')) return '📜';
    if (fileName.endsWith('.cs')) return '🔷';
    if (fileName.endsWith('.sql')) return '🗄️';
    if (fileName.endsWith('.json')) return '📦';
    if (fileName.endsWith('.yml') || fileName.endsWith('.yaml')) return '📋';
    if (fileName.endsWith('.md')) return '📝';
    if (fileName.endsWith('.css') || fileName.endsWith('.scss')) return '🎨';
    return '📄';
  };

  const getCategoryBadgeVariant = (category: string): string => {
    switch (category) {
      case 'backend': return 'success';
      case 'frontend': return 'primary';
      case 'sql': return 'warning';
      case 'tests': return 'danger';
      case 'docs': return 'info';
      default: return 'secondary';
    }
  };

  return (
    <div>
      {/* Summary */}
      <Alert variant="success" className="d-flex justify-content-between align-items-center">
        <div>
          <strong>✅ Code Generated Successfully!</strong>
          <div className="mt-1">
            <small>
              {generatedCode.formsGenerated} form(s) • {allFiles.length} files generated
            </small>
          </div>
          {generatedCode.message && (
            <div className="mt-1">
              <small className="text-muted">{generatedCode.message}</small>
            </div>
          )}
        </div>
        <div>
          <Button 
            variant="success" 
            onClick={onDownload}
          >
            ⬇️ Download ZIP
          </Button>
        </div>
      </Alert>

      <Card className="shadow-sm">
        <Card.Body>
          <div className="row">
            {/* File Tree */}
            <div className="col-md-3 border-end">
              <h6 className="mb-3">Files ({allFiles.length})</h6>
              
              {/* Group files by category */}
              {Object.entries(generatedCode.files).map(([category, files]) => {
                if (files.length === 0) return null;
                
                return (
                  <div key={category} className="mb-3">
                    <div className="mb-2">
                      <Badge bg={getCategoryBadgeVariant(category)} className="text-capitalize">
                        {category} ({files.length})
                      </Badge>
                    </div>
                    <Nav className="flex-column">
                      {files.map((file, index) => {
                        const fileWithCategory = { ...file, category };
                        const isSelected = selectedFile.fileName === file.fileName && 
                                          selectedFile.category === category;
                        
                        return (
                          <Nav.Link
                            key={`${category}-${index}`}
                            active={isSelected}
                            onClick={() => setSelectedFile(fileWithCategory)}
                            className="d-flex align-items-center text-start py-1 px-2"
                            style={{ fontSize: '0.9rem' }}
                          >
                            <span className="me-2">{getFileIcon(file.fileName)}</span>
                            <span className="text-truncate" title={file.fileName}>
                              {file.fileName}
                            </span>
                          </Nav.Link>
                        );
                      })}
                    </Nav>
                  </div>
                );
              })}
            </div>

            {/* Code Display */}
            <div className="col-md-9">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center">
                  <span className="me-2" style={{ fontSize: '1.5rem' }}>
                    {getLanguageIcon(selectedFile.language)}
                  </span>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h6 className="mb-0">{selectedFile.fileName}</h6>
                      <Badge bg={getCategoryBadgeVariant(selectedFile.category)} className="text-capitalize">
                        {selectedFile.category}
                      </Badge>
                    </div>
                    <small className="text-muted">{selectedFile.filePath}</small>
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
                <pre style={{ margin: 0, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                  <code>{selectedFile.content}</code>
                </pre>
              </div>

              <div className="mt-3">
                <small className="text-muted">
                  💡 Tip: Use the download buttons above to get ZIP archives of all generated files
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
