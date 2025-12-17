import { Form } from 'react-bootstrap';
import { useField } from 'formik';

interface FormInputProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  helpText?: string;
  disabled?: boolean;
  as?: 'input' | 'textarea' | 'select';
  rows?: number;
  children?: React.ReactNode; // For select options
}

const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  type = 'text',
  placeholder,
  helpText,
  disabled = false,
  as = 'input',
  rows,
  children,
}) => {
  const [field, meta] = useField(name);
  const hasError = meta.touched && meta.error;

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        {...field}
        type={type}
        as={as}
        {...(as === 'textarea' && rows ? { rows } : {})}
        placeholder={placeholder}
        disabled={disabled}
        isInvalid={!!hasError}
      >
        {children}
      </Form.Control>
      {hasError && <Form.Control.Feedback type="invalid">{meta.error}</Form.Control.Feedback>}
      {helpText && !hasError && <Form.Text className="text-muted">{helpText}</Form.Text>}
    </Form.Group>
  );
};

export default FormInput;
