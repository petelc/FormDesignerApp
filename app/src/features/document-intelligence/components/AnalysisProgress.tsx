import { Card, ProgressBar, Alert, Spinner } from 'react-bootstrap';
import { AnalysisStatus, AnalysisProgress as AnalysisProgressType } from '../types';
import { useEffect, useState } from 'react';

interface AnalysisProgressProps {
  progress: AnalysisProgressType;
  fileName?: string;
}

const getStatusIcon = (status: AnalysisStatus): string => {
  switch (status) {
    case AnalysisStatus.PENDING:
      return '⏳';
    case AnalysisStatus.PROCESSING:
      return '🔄';
    case AnalysisStatus.COMPLETED:
      return '✅';
    case AnalysisStatus.FAILED:
      return '❌';
    default:
      return '⏳';
  }
};

const getStatusColor = (status: AnalysisStatus): string => {
  switch (status) {
    case AnalysisStatus.PENDING:
      return 'secondary';
    case AnalysisStatus.PROCESSING:
      return 'primary';
    case AnalysisStatus.COMPLETED:
      return 'success';
    case AnalysisStatus.FAILED:
      return 'danger';
    default:
      return 'secondary';
  }
};

const getStatusText = (status: AnalysisStatus): string => {
  switch (status) {
    case AnalysisStatus.PENDING:
      return 'Waiting to start...';
    case AnalysisStatus.PROCESSING:
      return 'Analyzing document...';
    case AnalysisStatus.COMPLETED:
      return 'Analysis complete!';
    case AnalysisStatus.FAILED:
      return 'Analysis failed';
    default:
      return 'Unknown status';
  }
};

const AnalysisProgressComponent: React.FC<AnalysisProgressProps> = ({
  progress,
  fileName,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const icon = getStatusIcon(progress.status);
  const color = getStatusColor(progress.status);
  const statusText = getStatusText(progress.status);

  // Track elapsed time during processing
  useEffect(() => {
    if (progress.status === AnalysisStatus.PROCESSING) {
      setElapsedSeconds(0);
      const interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [progress.status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <div className="text-center mb-4">
          <div style={{ fontSize: '4rem' }} className="mb-3">
            {progress.status === AnalysisStatus.PROCESSING ? (
              <Spinner animation="border" variant="primary" />
            ) : (
              icon
            )}
          </div>
          <h4 className="mb-2">{statusText}</h4>
          {fileName && (
            <p className="text-muted mb-0">
              <small>{fileName}</small>
            </p>
          )}
          {progress.status === AnalysisStatus.PROCESSING && (
            <p className="text-muted mb-0 mt-2">
              <small>Elapsed: {formatTime(elapsedSeconds)}</small>
            </p>
          )}
        </div>

        {progress.status === AnalysisStatus.PROCESSING && (
          <div>
            <ProgressBar
              now={progress.progress}
              variant={color}
              label={`${progress.progress}%`}
              style={{ height: '30px', fontSize: '1rem' }}
              className="mb-3"
              animated
              striped
            />
            {progress.currentStep && (
              <Alert variant="info" className="mb-0">
                <small>
                  <strong>Current step:</strong> {progress.currentStep}
                </small>
              </Alert>
            )}
            {progress.message && (
              <p className="text-muted text-center mb-0 mt-2">
                <small>{progress.message}</small>
              </p>
            )}
            <div className="text-center mt-3">
              <small className="text-muted">
                ⏱️ Analyzing multiple forms may take a few minutes...
              </small>
            </div>
          </div>
        )}

        {progress.status === AnalysisStatus.COMPLETED && (
          <Alert variant="success" className="mb-0">
            <div className="d-flex align-items-center">
              <div className="flex-grow-1">
                <strong>Success!</strong> Document analyzed successfully.
                {progress.message && (
                  <div>
                    <small>{progress.message}</small>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}

        {progress.status === AnalysisStatus.FAILED && progress.message && (
          <Alert variant="danger" className="mb-0">
            <strong>Error:</strong> {progress.message}
          </Alert>
        )}

        {progress.status === AnalysisStatus.PENDING && (
          <Alert variant="info" className="mb-0">
            Your document is in the queue and will be processed shortly...
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default AnalysisProgressComponent;
