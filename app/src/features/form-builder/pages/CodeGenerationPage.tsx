import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { useAppSelector } from '@/app/hooks';
import {
  CodeTemplate,
  CodeGenerationOptions,
  ValidationLibrary,
} from '@/features/code-generation/types';
import { generateCode } from '@/features/code-generation/utils/codeGenerator';
import { convertFormSchemaToExtractedStructure } from '../utils/formSchemaConverter';
import { LoadingSpinner } from '@/shared/components/ui';
import CodeViewer from '@/features/code-generation/components/CodeViewer';

const CodeGenerationPage = () => {
  const navigate = useNavigate();
  const { currentForm } = useAppSelector((state) => state.formBuilder);

  const [options, setOptions] = useState<CodeGenerationOptions>({
    template: CodeTemplate.REACT_TYPESCRIPT,
    validationLibrary: ValidationLibrary.YUP,
    formLibrary: 'formik',
    styling: 'bootstrap',
    includeBackend: true,
    backendFramework: undefined, // Will use .NET by default in generator
    includeTests: true,
    includeDocumentation: true,
  });

  const [generatedCode, setGeneratedCode] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!currentForm) {
    return (
      <div className="container mt-5">
        <Alert variant="warning">
          <h5>No Form Found</h5>
          <p>Please create a form first before generating code.</p>
          <Button variant="primary" onClick={() => navigate('/app/form-builder')}>
            Go to Form Builder
          </Button>
        </Alert>
      </div>
    );
  }

  const handleGenerate = async () => {
    setIsGenerating(true);

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // Convert form schema to extracted structure
      const extractedStructure = convertFormSchemaToExtractedStructure(currentForm);

      // Generate code
      const code = generateCode(extractedStructure, currentForm.name, options);

      setGeneratedCode(code);
    } catch (error) {
      console.error('Code generation error:', error);
      alert('Error generating code. Check console for details.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadFrontend = () => {
    alert('Frontend download will be implemented');
    // TODO: Create ZIP with frontend files
  };

  const handleDownloadBackend = () => {
    alert('Backend download will be implemented');
    // TODO: Create ZIP with backend files
  };

  const handleDownloadBoth = () => {
    alert('Combined download will be implemented');
    // TODO: Create ZIP with both packages
  };

  return (
    <div className="vh-100 d-flex flex-column">
      {/* Header */}
      <div className="bg-white border-bottom p-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <Button
              variant="link"
              onClick={() => navigate('/app/form-builder')}
              className="p-0 text-decoration-none me-3"
            >
              ← Back to Builder
            </Button>
            <span className="h5 mb-0">Generate Code: {currentForm.name}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-grow-1 overflow-auto p-4">
        <Row>
          <Col lg={4}>
            {/* Options Panel */}
            <Card className="mb-3">
              <Card.Header className="bg-primary text-white">
                <strong>Generation Options</strong>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Frontend Framework</Form.Label>
                  <div className="d-grid gap-2">
                    <Button
                      variant={
                        options.template === CodeTemplate.REACT_TYPESCRIPT
                          ? 'primary'
                          : 'outline-primary'
                      }
                      onClick={() =>
                        setOptions({ ...options, template: CodeTemplate.REACT_TYPESCRIPT })
                      }
                    >
                      ⚛️ React TypeScript
                      <Badge bg="success" className="ms-2">
                        Recommended
                      </Badge>
                    </Button>
                  </div>
                  <Form.Text>TypeScript for type safety</Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Form Library</Form.Label>
                  <Form.Select
                    value={options.formLibrary}
                    onChange={(e) =>
                      setOptions({ ...options, formLibrary: e.target.value as any })
                    }
                  >
                    <option value="formik">Formik</option>
                    <option value="react-hook-form">React Hook Form</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Validation</Form.Label>
                  <Form.Select
                    value={options.validationLibrary}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        validationLibrary: e.target.value as ValidationLibrary,
                      })
                    }
                  >
                    <option value={ValidationLibrary.YUP}>Yup</option>
                    <option value={ValidationLibrary.ZOD}>Zod</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Styling</Form.Label>
                  <Form.Select
                    value={options.styling}
                    onChange={(e) => setOptions({ ...options, styling: e.target.value as any })}
                  >
                    <option value="bootstrap">Bootstrap</option>
                    <option value="tailwind">Tailwind CSS</option>
                    <option value="mui">Material-UI</option>
                    <option value="custom">Custom CSS</option>
                  </Form.Select>
                </Form.Group>

                <hr />

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label={
                      <span>
                        <strong>Include Backend API (.NET Core)</strong>
                        <br />
                        <small className="text-muted">
                          Generates C# controllers, Entity Framework models, and SQL Server schema
                        </small>
                      </span>
                    }
                    checked={options.includeBackend}
                    onChange={(e) =>
                      setOptions({ ...options, includeBackend: e.target.checked })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Include unit tests"
                    checked={options.includeTests}
                    onChange={(e) => setOptions({ ...options, includeTests: e.target.checked })}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check
                    type="checkbox"
                    label="Include documentation"
                    checked={options.includeDocumentation}
                    onChange={(e) =>
                      setOptions({ ...options, includeDocumentation: e.target.checked })
                    }
                  />
                </Form.Group>

                <Button
                  variant="success"
                  size="lg"
                  className="w-100"
                  onClick={handleGenerate}
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
              </Card.Body>
            </Card>

            {/* Form Summary */}
            <Card>
              <Card.Header>Form Summary</Card.Header>
              <Card.Body>
                <p className="mb-2">
                  <strong>Name:</strong> {currentForm.name}
                </p>
                <p className="mb-2">
                  <strong>Fields:</strong> {currentForm.fields.length}
                </p>
                <p className="mb-2">
                  <strong>Sections:</strong> {currentForm.sections.length}
                </p>
                <p className="mb-0">
                  <strong>Validations:</strong>{' '}
                  {currentForm.fields.reduce((sum, f) => sum + (f.validations?.length || 0), 0)}
                </p>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            {/* Generated Code Display */}
            {!generatedCode && !isGenerating && (
              <Alert variant="info">
                <h5>👈 Configure options and click "Generate Code"</h5>
                <p className="mb-0">
                  Your form will be converted to production-ready React components and .NET API
                  code.
                </p>
              </Alert>
            )}

            {isGenerating && <LoadingSpinner message="Generating production-ready code..." />}

            {generatedCode && (
              <>
                {/* Success Message */}
                <Alert variant="success" className="mb-3">
                  <h5>✅ Code Generated Successfully!</h5>
                  <p className="mb-0">
                    {generatedCode.files.length} files created. Download packages below.
                  </p>
                </Alert>

                {/* Download Buttons */}
                <Card className="mb-3">
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Card className="text-center mb-3 mb-md-0">
                          <Card.Body>
                            <div style={{ fontSize: '3rem' }}>⚛️</div>
                            <h6>Frontend Package</h6>
                            <small className="text-muted d-block mb-3">
                              React component + validation + types
                            </small>
                            <Button
                              variant="primary"
                              className="w-100"
                              onClick={handleDownloadFrontend}
                            >
                              Download Frontend
                            </Button>
                          </Card.Body>
                        </Card>
                      </Col>

                      {options.includeBackend && (
                        <Col md={6}>
                          <Card className="text-center">
                            <Card.Body>
                              <div style={{ fontSize: '3rem' }}>🟦</div>
                              <h6>Backend Package</h6>
                              <small className="text-muted d-block mb-3">
                                .NET Core API + SQL Server + Entity Framework
                              </small>
                              <Button
                                variant="success"
                                className="w-100"
                                onClick={handleDownloadBackend}
                              >
                                Download Backend
                              </Button>
                            </Card.Body>
                          </Card>
                        </Col>
                      )}
                    </Row>

                    {options.includeBackend && (
                      <Button
                        variant="outline-primary"
                        className="w-100 mt-3"
                        onClick={handleDownloadBoth}
                      >
                        📦 Download Both Packages
                      </Button>
                    )}
                  </Card.Body>
                </Card>

                {/* Code Viewer */}
                <CodeViewer
                  generatedCode={generatedCode}
                  onDownload={handleDownloadBoth}
                />
              </>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CodeGenerationPage;
