import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tabs, Tab, Badge, Alert, Row, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useToast, usePolling } from '@/shared/hooks';
import { fetchProject, uploadPdf } from '../slices/projectsSlice';
import { ProjectStatus } from '../types';
import { LoadingSpinner } from '@/shared/components/ui';
import { formatDate, getRelativeTime } from '@/shared/utils';
import { projectsAPI } from '../services/projectsAPI';
import PdfUploadZone from '@/features/pdf-upload/components/PdfUploadZone';
import PdfPreview from '@/features/pdf-upload/components/PdfPreview';
import AnalysisProgress from '@/features/document-intelligence/components/AnalysisProgress';
import ExtractedFieldsList from '@/features/document-intelligence/components/ExtractedFieldsList';
import { AnalysisStatus, AnalysisProgress as AnalysisProgressType } from '@/features/document-intelligence/types';
import TemplateSelector from '@/features/code-generation/components/TemplateSelector';
import CodeViewer from '@/features/code-generation/components/CodeViewer';
import {
  CodeGenerationOptions,
  CodeTemplate,
  ValidationLibrary,
  GeneratedCode,
} from '@/features/code-generation/types';
import { generateCode } from '@/features/code-generation/utils/codeGenerator';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { currentProject, isLoading, isUploading, uploadProgress } = useAppSelector(
    (state) => state.projects
  );

  const [activeTab, setActiveTab] = useState('overview');
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgressType>({
    status: AnalysisStatus.PENDING,
    progress: 0,
  });
  const [codeGenOptions, setCodeGenOptions] = useState<CodeGenerationOptions>({
    template: CodeTemplate.REACT_TYPESCRIPT,
    validationLibrary: ValidationLibrary.YUP,
    includeTests: true,
    includeDocumentation: true,
    includeBackend: false,
    styling: 'bootstrap',
    formLibrary: 'formik',
  });
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Load project
  useEffect(() => {
    if (id) {
      dispatch(fetchProject(id));
    }
  }, [dispatch, id]);

  // Poll analysis status if analyzing
  const { isPolling } = usePolling(
    async () => {
      if (!id) return null;
      const status = await projectsAPI.getAnalysisStatus(id);
      setAnalysisProgress({
        status: status.status as AnalysisStatus,
        progress: status.progress || 0,
        message: status.message,
      });
      return status;
    },
    (result) => result?.status === 'completed' || result?.status === 'failed',
    {
      enabled: currentProject?.status === ProjectStatus.ANALYZING,
      interval: 2000,
      maxAttempts: 60,
    }
  );

  const handleFileSelected = async (file: File) => {
    if (!id) return;
    
    const result = await dispatch(uploadPdf({ projectId: id, file }));
    
    if (uploadPdf.fulfilled.match(result)) {
      toast.success('PDF uploaded successfully!');
      setActiveTab('pdf');
    } else {
      toast.error('Failed to upload PDF');
    }
  };

  const handleStartAnalysis = async () => {
    if (!id) return;
    
    try {
      await projectsAPI.startAnalysis(id);
      toast.success('Analysis started!');
      setAnalysisProgress({
        status: AnalysisStatus.PROCESSING,
        progress: 0,
        message: 'Initializing document analysis...',
      });
    } catch (error) {
      toast.error('Failed to start analysis');
    }
  };

  const handleGenerateCode = async () => {
    if (!currentProject?.documentIntelligenceResult?.formStructure) {
      toast.error('No form structure available');
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const code = generateCode(
        currentProject.documentIntelligenceResult.formStructure,
        currentProject.name,
        codeGenOptions
      );
      
      setGeneratedCode(code);
      toast.success('Code generated successfully!');
      setActiveTab('code');
    } catch (error) {
      toast.error('Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCode = () => {
    if (!generatedCode) return;
    
    toast.info('Download feature coming soon! Files are displayed in the viewer.');
    // In production, this would create a ZIP file and trigger download
  };

  if (isLoading && !currentProject) {
    return <LoadingSpinner fullScreen message="Loading project..." />;
  }

  if (!currentProject) {
    return (
      <Alert variant="warning">
        Project not found. <Button variant="link" onClick={() => navigate('/app/projects')}>Go back</Button>
      </Alert>
    );
  }

  const getStatusBadge = () => {
    const statusColors: Record<ProjectStatus, string> = {
      [ProjectStatus.DRAFT]: 'secondary',
      [ProjectStatus.PDF_UPLOADED]: 'info',
      [ProjectStatus.ANALYZING]: 'warning',
      [ProjectStatus.ANALYSIS_COMPLETE]: 'success',
      [ProjectStatus.STRUCTURE_REVIEWED]: 'primary',
      [ProjectStatus.GENERATING_CODE]: 'warning',
      [ProjectStatus.CODE_GENERATED]: 'success',
      [ProjectStatus.COMPLETED]: 'success',
      [ProjectStatus.FAILED]: 'danger',
    };

    return (
      <Badge bg={statusColors[currentProject.status]}>
        {currentProject.status.split('_').map(word => 
          word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ')}
      </Badge>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-3 mb-2">
            <Button
              variant="link"
              onClick={() => navigate('/app/projects')}
              className="p-0 text-decoration-none"
            >
              ← Back to Projects
            </Button>
          </div>
          <h1 className="mb-2">{currentProject.name}</h1>
          <p className="text-muted mb-2">{currentProject.description}</p>
          <div className="d-flex gap-2 align-items-center">
            {getStatusBadge()}
            <span className="text-muted">•</span>
            <small className="text-muted">
              Created {getRelativeTime(currentProject.createdAt)}
            </small>
            <span className="text-muted">•</span>
            <small className="text-muted">
              Updated {formatDate(currentProject.updatedAt)}
            </small>
          </div>
        </div>
      </div>

      {/* Progress Tracker */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div className={`text-center ${currentProject.status !== ProjectStatus.DRAFT ? 'text-success' : ''}`}>
              <div style={{ fontSize: '2rem' }}>📝</div>
              <small>Draft</small>
            </div>
            <div style={{ borderTop: '2px solid #ccc', flex: 1, margin: '0 1rem' }} />
            <div className={`text-center ${currentProject.originalPdfUrl ? 'text-success' : ''}`}>
              <div style={{ fontSize: '2rem' }}>📄</div>
              <small>PDF Upload</small>
            </div>
            <div style={{ borderTop: '2px solid #ccc', flex: 1, margin: '0 1rem' }} />
            <div className={`text-center ${currentProject.status === ProjectStatus.ANALYSIS_COMPLETE || currentProject.status === ProjectStatus.STRUCTURE_REVIEWED ? 'text-success' : ''}`}>
              <div style={{ fontSize: '2rem' }}>🤖</div>
              <small>Analysis</small>
            </div>
            <div style={{ borderTop: '2px solid #ccc', flex: 1, margin: '0 1rem' }} />
            <div className={`text-center ${currentProject.status === ProjectStatus.CODE_GENERATED || currentProject.status === ProjectStatus.COMPLETED ? 'text-success' : ''}`}>
              <div style={{ fontSize: '2rem' }}>💻</div>
              <small>Code Gen</small>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Main Content Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')} className="mb-3">
        <Tab eventKey="overview" title="📋 Overview">
          <Card className="shadow-sm">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h5 className="mb-3">Project Details</h5>
                  <div className="mb-3">
                    <small className="text-muted">Name</small>
                    <div>{currentProject.name}</div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Description</small>
                    <div>{currentProject.description}</div>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted">Status</small>
                    <div>{getStatusBadge()}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <h5 className="mb-3">Quick Actions</h5>
                  {currentProject.status === ProjectStatus.DRAFT && (
                    <Alert variant="info">
                      <strong>Next step:</strong> Upload a PDF form to begin analysis
                    </Alert>
                  )}
                  {currentProject.status === ProjectStatus.PDF_UPLOADED && (
                    <Button variant="primary" onClick={handleStartAnalysis}>
                      🤖 Start AI Analysis
                    </Button>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="upload" title="📤 Upload PDF">
          {currentProject.originalPdfUrl ? (
            <PdfPreview
              pdfUrl={currentProject.originalPdfUrl}
              fileName={currentProject.originalPdfFileName}
            />
          ) : (
            <PdfUploadZone
              onFileSelected={handleFileSelected}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          )}
        </Tab>

        <Tab eventKey="analysis" title="🤖 Analysis" disabled={currentProject.status === ProjectStatus.DRAFT}>
          {currentProject.status === ProjectStatus.ANALYZING || isPolling ? (
            <AnalysisProgress
              progress={analysisProgress}
              fileName={currentProject.originalPdfFileName}
            />
          ) : currentProject.documentIntelligenceResult ? (
            <ExtractedFieldsList
              fields={currentProject.documentIntelligenceResult.formStructure?.fields || []}
            />
          ) : (
            <Alert variant="info">
              Analysis results will appear here once complete.
            </Alert>
          )}
        </Tab>

        <Tab eventKey="code" title="💻 Generated Code" disabled={currentProject.status !== ProjectStatus.CODE_GENERATED && currentProject.status !== ProjectStatus.COMPLETED && !currentProject.documentIntelligenceResult}>
          {generatedCode ? (
            <CodeViewer
              generatedCode={generatedCode}
              onDownload={handleDownloadCode}
            />
          ) : (
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-4">Generate Code</h5>
                
                {currentProject.documentIntelligenceResult ? (
                  <>
                    <TemplateSelector
                      options={codeGenOptions}
                      onChange={setCodeGenOptions}
                    />
                    
                    <div className="d-flex justify-content-end mt-4">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleGenerateCode}
                        disabled={isGenerating}
                      >
                        {isGenerating ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" />
                            Generating...
                          </>
                        ) : (
                          <>⚡ Generate Code</>
                        )}
                      </Button>
                    </div>
                  </>
                ) : (
                  <Alert variant="info">
                    Complete the analysis first to generate code.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          )}
        </Tab>
      </Tabs>
    </div>
  );
};

export default ProjectDetailPage;
