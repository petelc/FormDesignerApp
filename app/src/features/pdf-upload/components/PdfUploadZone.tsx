import { useCallback, useState } from 'react';
import { Card, Button, ProgressBar, Alert } from 'react-bootstrap';
import { validateFile, formatFileSize } from '@/shared/utils';

interface PdfUploadZoneProps {
  onFileSelected: (file: File) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  error?: string | null;
  maxFileSize?: number; // in bytes
}

const PdfUploadZone: React.FC<PdfUploadZoneProps> = ({
  onFileSelected,
  isUploading = false,
  uploadProgress = 0,
  error,
  maxFileSize = 10 * 1024 * 1024, // 10MB default
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelection(files[0]);
      }
    },
    []
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFileSelection(files[0]);
      }
    },
    []
  );

  const handleFileSelection = (file: File) => {
    const validation = validateFile(file);
    
    if (!validation.isValid) {
      return; // Error will be shown by parent component
    }

    setSelectedFile(file);
    onFileSelected(file);
  };

  const handleBrowseClick = () => {
    document.getElementById('pdf-file-input')?.click();
  };

  return (
    <div>
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <Card
        className={`border-2 border-dashed ${
          isDragging ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
        } transition`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Card.Body className="text-center py-5">
          {isUploading ? (
            <div>
              <div style={{ fontSize: '3rem' }} className="mb-3">
                📤
              </div>
              <h5 className="mb-3">Uploading PDF...</h5>
              <ProgressBar
                now={uploadProgress}
                label={`${uploadProgress}%`}
                className="mb-2"
                style={{ height: '25px' }}
              />
              <small className="text-muted">
                {selectedFile && `Uploading ${selectedFile.name}`}
              </small>
            </div>
          ) : selectedFile ? (
            <div>
              <div style={{ fontSize: '3rem' }} className="mb-3">
                📄
              </div>
              <h5 className="mb-2">{selectedFile.name}</h5>
              <p className="text-muted mb-3">{formatFileSize(selectedFile.size)}</p>
              <Button variant="outline-primary" onClick={handleBrowseClick}>
                Choose Different File
              </Button>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '4rem' }} className="mb-3">
                📁
              </div>
              <h4 className="mb-2">Drop your PDF here</h4>
              <p className="text-muted mb-3">
                or click to browse from your computer
              </p>
              <Button variant="primary" onClick={handleBrowseClick}>
                Browse Files
              </Button>
              <p className="text-muted mt-3 mb-0">
                <small>Maximum file size: {formatFileSize(maxFileSize)}</small>
              </p>
            </div>
          )}

          <input
            id="pdf-file-input"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </Card.Body>
      </Card>

      {selectedFile && !isUploading && (
        <div className="mt-3 alert alert-info">
          <small>
            <strong>Ready to upload:</strong> {selectedFile.name} (
            {formatFileSize(selectedFile.size)})
          </small>
        </div>
      )}
    </div>
  );
};

export default PdfUploadZone;
