import { Card, Form, Row, Col, Badge } from 'react-bootstrap';
import {
  CodeTemplate,
  BackendFramework,
  ValidationLibrary,
  CodeGenerationOptions,
} from '../types';

interface TemplateSelectorProps {
  options: CodeGenerationOptions;
  onChange: (options: CodeGenerationOptions) => void;
}

const templates = [
  {
    value: CodeTemplate.REACT_TYPESCRIPT,
    label: 'React + TypeScript',
    icon: '⚛️',
    description: 'Modern React with TypeScript and hooks',
  },
  {
    value: CodeTemplate.REACT_JAVASCRIPT,
    label: 'React + JavaScript',
    icon: '⚛️',
    description: 'React with vanilla JavaScript',
    popular: true,
  },
  {
    value: CodeTemplate.CSHARP_ASPNET,
    label: 'ASP.NET Core',
    icon: '🔷',
    description: 'ASP.NET Core with C#',
    popular: true,
  },
  {
    value: CodeTemplate.SQL_SCRIPTS,
    label: 'Create Table, Stored Procedures Scripts',
    icon: '🗄️',
    description: 'SQL scripts for creating tables and stored procedures',
    popular: true,
  },
];

const backendFrameworks = [
  { value: BackendFramework.EXPRESS, label: 'Express.js', icon: '🚂' },
  { value: BackendFramework.NESTJS, label: 'NestJS', icon: '🐱' },
  { value: BackendFramework.FASTAPI, label: 'FastAPI', icon: '⚡' },
  { value: BackendFramework.DJANGO, label: 'Django', icon: '🎸' },
  { value: BackendFramework.SPRING_BOOT, label: 'Spring Boot', icon: '🍃' },
];

const validationLibraries = [
  { value: ValidationLibrary.YUP, label: 'Yup', popular: true },
  { value: ValidationLibrary.ZOD, label: 'Zod', popular: true },
  { value: ValidationLibrary.JOI, label: 'Joi' },
  { value: ValidationLibrary.CLASS_VALIDATOR, label: 'Class Validator' },
];

const formLibraries = [
  { value: 'formik', label: 'Formik', popular: true },
  { value: 'react-hook-form', label: 'React Hook Form', popular: true },
  { value: 'none', label: 'None (vanilla)' },
];

const stylingOptions = [
  { value: 'bootstrap', label: 'Bootstrap', popular: true },
  { value: 'tailwind', label: 'Tailwind CSS', popular: true },
  { value: 'mui', label: 'Material-UI' },
  { value: 'css', label: 'Plain CSS' },
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ options, onChange }) => {
  const handleChange = (field: keyof CodeGenerationOptions, value: any) => {
    onChange({ ...options, [field]: value });
  };

  return (
    <div>
      <h5 className="mb-3">Select Your Template</h5>

      {/* Frontend Template */}
      <Card className="mb-3">
        <Card.Body>
          <h6 className="mb-3">Frontend Framework</h6>
          <Row>
            {templates.map((template) => (
              <Col key={template.value} md={6} lg={4} className="mb-3">
                <Card
                  className={`h-100 cursor-pointer transition hover-shadow ${
                    options.template === template.value ? 'border-primary border-2' : ''
                  }`}
                  onClick={() => handleChange('template', template.value)}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div style={{ fontSize: '2rem' }}>{template.icon}</div>
                      {template.popular && (
                        <Badge bg="success" className="ms-2">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <h6 className="mb-1">{template.label}</h6>
                    <small className="text-muted">{template.description}</small>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      {/* Form Library */}
      <Card className="mb-3">
        <Card.Body>
          <h6 className="mb-3">Form Management</h6>
          <Form.Select
            value={options.formLibrary}
            onChange={(e) => handleChange('formLibrary', e.target.value)}
          >
            {formLibraries.map((lib) => (
              <option key={lib.value} value={lib.value}>
                {lib.label} {lib.popular ? '⭐' : ''}
              </option>
            ))}
          </Form.Select>
        </Card.Body>
      </Card>

      {/* Validation Library */}
      <Card className="mb-3">
        <Card.Body>
          <h6 className="mb-3">Validation</h6>
          <Form.Select
            value={options.validationLibrary}
            onChange={(e) => handleChange('validationLibrary', e.target.value as ValidationLibrary)}
          >
            {validationLibraries.map((lib) => (
              <option key={lib.value} value={lib.value}>
                {lib.label} {lib.popular ? '⭐' : ''}
              </option>
            ))}
          </Form.Select>
        </Card.Body>
      </Card>

      {/* Styling */}
      <Card className="mb-3">
        <Card.Body>
          <h6 className="mb-3">Styling</h6>
          <Form.Select
            value={options.styling}
            onChange={(e) => handleChange('styling', e.target.value)}
          >
            {stylingOptions.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label} {style.popular ? '⭐' : ''}
              </option>
            ))}
          </Form.Select>
        </Card.Body>
      </Card>

      {/* Backend */}
      <Card className="mb-3">
        <Card.Body>
          <Form.Check
            type="checkbox"
            label="Include Backend API"
            checked={options.includeBackend}
            onChange={(e) => handleChange('includeBackend', e.target.checked)}
            className="mb-3"
          />

          {options.includeBackend && (
            <>
              <h6 className="mb-3">Backend Framework</h6>
              <Row>
                {backendFrameworks.map((framework) => (
                  <Col key={framework.value} md={6} className="mb-2">
                    <Card
                      className={`cursor-pointer transition hover-shadow ${
                        options.backendFramework === framework.value
                          ? 'border-primary border-2'
                          : ''
                      }`}
                      onClick={() => handleChange('backendFramework', framework.value)}
                    >
                      <Card.Body className="py-2">
                        <div className="d-flex align-items-center">
                          <span className="me-2" style={{ fontSize: '1.5rem' }}>
                            {framework.icon}
                          </span>
                          <span>{framework.label}</span>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Additional Options */}
      <Card className="mb-3">
        <Card.Body>
          <h6 className="mb-3">Additional Options</h6>
          <Form.Check
            type="checkbox"
            label="Include Unit Tests"
            checked={options.includeTests}
            onChange={(e) => handleChange('includeTests', e.target.checked)}
            className="mb-2"
          />
          <Form.Check
            type="checkbox"
            label="Include Documentation"
            checked={options.includeDocumentation}
            onChange={(e) => handleChange('includeDocumentation', e.target.checked)}
          />
        </Card.Body>
      </Card>
    </div>
  );
};

export default TemplateSelector;
