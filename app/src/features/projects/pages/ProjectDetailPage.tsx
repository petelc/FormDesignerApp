import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Tabs, Tab, Badge, Alert, Row, Col } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { useToast, usePolling } from '@/shared/hooks';
import { fetchProject, uploadPdf, updateCurrentProjectStatus } from '../slices/projectsSlice';
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
  ProjectCodeGenerationResponse,
} from '@/features/code-generation/types';
import { downloadGeneratedCodeAsZip } from '@/features/code-generation/utils/downloadZip';

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
  const [generatedCode, setGeneratedCode] = useState<ProjectCodeGenerationResponse | null>(null);
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
      console.log('Analysis status poll:', status);
      
      setAnalysisProgress({
        status: status.status as AnalysisStatus,
        progress: status.progress || 0,
        message: status.message,
      });
      
      return status;
    },
    async (result) => {
      const isDone = result?.status === 'completed' || 
                     result?.status === 'failed' || 
                     result?.status === 'Completed' || 
                     result?.status === 'Failed' ||
                     result?.status === 'ANALYSING_COMPLETE' ||
                     result?.status === 'ANALYSIS_COMPLETE';
      
      if (isDone && id) {
        console.log('Analysis completed! Status:', result?.status);
        
        // Fetch the analysis results
        try {
          const analysisResult = await projectsAPI.getAnalysisResult(id);
          console.log('Fetched analysis results:', analysisResult);
          
          // Update current project with the results
          await dispatch(fetchProject(id));
          
          toast.success('Analysis complete!');
          setActiveTab('analysis');
        } catch (error) {
          console.error('Error fetching analysis results:', error);
          toast.error('Analysis complete but failed to load results');
        }
      }
      
      return isDone;
    },
    {
      enabled: currentProject?.status === ProjectStatus.ANALYZING,
      interval: 2000,
      maxAttempts: 60,
    }
  );

  const handleFileSelected = async (file: File) => {
    if (!id) return;
    
    const result = await dispatch(
      uploadPdf({
        projectId: id,
        file,
        onProgress: (progress) => {
          console.log('Dispatching upload progress:', progress);
          dispatch({ type: 'projects/setUploadProgress', payload: progress });
        },
      })
    );
    
    if (uploadPdf.fulfilled.match(result)) {
      // Set to 100% now that we have the response
      dispatch({ type: 'projects/setUploadProgress', payload: 100 });
      toast.success('PDF uploaded successfully!');
      
      // Refetch the project to get updated data with dates and status
      await dispatch(fetchProject(id));
      
      // Small delay to ensure backend has updated status
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Automatically start analysis
      toast.info('Starting AI analysis...');
      await handleStartAnalysis();
      setActiveTab('analysis');
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
      // Refetch project to update status
      await dispatch(fetchProject(id));
    } catch (error) {
      toast.error('Failed to start analysis');
    }
  };

  const handleGenerateCode = async () => {
    if (!currentProject || !id) {
      toast.error('No project selected');
      return;
    }

    setIsGenerating(true);
    
    // Optimistically update status to show "Generating Code" immediately
    dispatch(updateCurrentProjectStatus(ProjectStatus.GENERATING_CODE));
    
    try {
      const response = await projectsAPI.generateProjectCode(
        currentProject.id,
        {
          template: codeGenOptions.template,
          includeTests: codeGenOptions.includeTests,
          includeDocumentation: codeGenOptions.includeDocumentation,
        }
      );
      
      setGeneratedCode(response);
      toast.success(response.message || 'Code generated successfully!');
      setActiveTab('code');
      
      // Refetch project to get the actual updated status from backend
      await dispatch(fetchProject(id));
    } catch (error) {
      toast.error('Failed to generate code');
      console.error('Code generation error:', error);
      
      // Revert status on error by refetching
      await dispatch(fetchProject(id));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadCode = async () => {
    if (!generatedCode) return;
    
    // If download URLs are available, fetch and download them
    if (generatedCode.downloadUrls && generatedCode.downloadUrls.length > 0) {
      try {
        for (const url of generatedCode.downloadUrls) {
          // Use fetch with credentials to download via the API client
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          });
          
          if (!response.ok) {
            throw new Error(`Download failed: ${response.statusText}`);
          }
          
          const blob = await response.blob();
          const downloadUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = `generated-code-${Date.now()}.zip`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(downloadUrl);
          document.body.removeChild(a);
        }
        toast.success('Download started!');
      } catch (error) {
        console.error('Download error:', error);
        toast.warning('Falling back to client-side ZIP generation...');
        // Fallback to client-side ZIP generation
        await downloadGeneratedCodeAsZip(generatedCode);
        toast.success('ZIP file downloaded!');
      }
    } else {
      // No backend download URLs, create ZIP client-side
      try {
        await downloadGeneratedCodeAsZip(generatedCode);
        toast.success('ZIP file downloaded!');
      } catch (error) {
        console.error('ZIP generation error:', error);
        toast.error('Failed to create ZIP file.');
      }
    }
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

    const status = currentProject.status || ProjectStatus.DRAFT;
    
    return (
      <Badge bg={statusColors[status]}>
        {status.split('_').map(word => 
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
          {/* Debug Info - Always visible */}
          <Card className="mb-3 shadow-sm border-info">
            <Card.Body>
              <h6 className="mb-3">🔍 Debug Information</h6>
              <Row>
                <Col md={6}>
                  <div className="mb-2">
                    <small><strong>Project Status:</strong> {currentProject.status}</small>
                  </div>
                  <div className="mb-2">
                    <small><strong>Analysis Status:</strong> {analysisProgress.status}</small>
                  </div>
                  <div className="mb-2">
                    <small><strong>Progress:</strong> {analysisProgress.progress}%</small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-2">
                    <small><strong>Polling Active:</strong> {isPolling ? 'Yes' : 'No'}</small>
                  </div>
                  <div className="mb-2">
                    <small><strong>Has Results:</strong> {currentProject.documentIntelligenceResult ? 'Yes' : 'No'}</small>
                  </div>
                  <div className="mb-2">
                    <small><strong>Message:</strong> {analysisProgress.message || 'N/A'}</small>
                  </div>
                </Col>
              </Row>
              <div className="mt-3">
                <Button 
                  size="sm" 
                  variant="outline-primary"
                  onClick={async () => {
                    if (id) {
                      const status = await projectsAPI.getAnalysisStatus(id);
                      console.log('Manual status check:', status);
                      toast.info(`Status: ${status.status}, Progress: ${status.progress}%`);
                    }
                  }}
                >
                  🔄 Check Status
                </Button>
                <Button 
                  size="sm" 
                  variant="outline-secondary"
                  className="ms-2"
                  onClick={async () => {
                    if (id) {
                      await dispatch(fetchProject(id));
                      toast.info('Project refreshed');
                    }
                  }}
                >
                  🔃 Refresh Project
                </Button>
                <Button 
                  size="sm" 
                  variant="outline-info"
                  className="ms-2"
                  onClick={async () => {
                    if (id) {
                      try {
                        const result = await projectsAPI.getAnalysisResult(id);
                        console.log('Analysis result:', result);
                        
                        // Update the current project with the results
                        if (currentProject) {
                          const updatedProject = {
                            ...currentProject,
                            documentIntelligenceResult: result,
                          };
                          // Force update by refetching
                          await dispatch(fetchProject(id));
                          toast.success('Results loaded! Check the Analysis tab.');
                        }
                      } catch (error) {
                        console.error('Error fetching result:', error);
                        toast.error('Failed to fetch analysis result');
                      }
                    }
                  }}
                >
                  📊 Load Results
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Main Content */}
          {currentProject.status === ProjectStatus.ANALYZING && isPolling ? (
            <AnalysisProgress
              progress={analysisProgress}
              fileName={currentProject.originalPdfFileName}
            />
          ) : (currentProject.documentIntelligenceResult || 
              currentProject.status === ProjectStatus.ANALYSIS_COMPLETE ||
              currentProject.status === ProjectStatus.STRUCTURE_REVIEWED ||
              currentProject.status === ProjectStatus.CODE_GENERATED ||
              currentProject.status === ProjectStatus.COMPLETED) ? (
            <>
              <Alert variant="success" className="mb-3">
                <strong>✅ Analysis Complete!</strong> Review the extracted fields below.
              </Alert>
              {currentProject.documentIntelligenceResult?.formStructure?.fields ? (
                <ExtractedFieldsList
                  fields={currentProject.documentIntelligenceResult.formStructure.fields}
                />
              ) : currentProject.documentIntelligenceResult?.forms?.[0]?.fields ? (
                <>
                  <Card className="shadow-sm mb-3">
                    <Card.Body>
                      <h5>Extracted Fields from {currentProject.documentIntelligenceResult.forms[0].fileName}</h5>
                      <p className="text-muted">
                        {currentProject.documentIntelligenceResult.forms[0].fieldCount} fields detected
                      </p>
                    </Card.Body>
                  </Card>
                  <ExtractedFieldsList
                    fields={currentProject.documentIntelligenceResult.forms[0].fields}
                  />
                  <Card className="shadow-sm mt-3">
                    <Card.Body>
                      <Button 
                        variant="primary" 
                        size="lg"
                        onClick={() => setActiveTab('code')}
                      >
                        Continue to Code Generation →
                      </Button>
                    </Card.Body>
                  </Card>
                </>
              ) : (
                <Card className="shadow-sm">
                  <Card.Body>
                    <h6 className="mb-3">Analysis Result (Raw Data)</h6>
                    <pre className="bg-light p-3 rounded" style={{ maxHeight: '400px', overflow: 'auto' }}>
                      {JSON.stringify(currentProject.documentIntelligenceResult, null, 2)}
                    </pre>
                    <Button 
                      variant="primary" 
                      className="mt-3"
                      onClick={() => setActiveTab('code')}
                      disabled={!currentProject.documentIntelligenceResult}
                    >
                      Continue to Code Generation →
                    </Button>
                  </Card.Body>
                </Card>
              )}
            </>
          ) : (
            <Alert variant="info">
              Analysis results will appear here once complete.
              <div className="mt-2">
                <small><strong>Current Status:</strong> {currentProject.status}</small>
              </div>
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
