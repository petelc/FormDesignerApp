import { Form } from 'react-bootstrap';
import { useField } from 'formik';

interface FormCheckboxProps {
  name: string;
  label: string;
  disabled?: boolean;
}

const FormCheckbox: React.FC<FormCheckboxProps> = ({ name, label, disabled = false }) => {
  const [field, meta] = useField({ name, type: 'checkbox' });

  return (
    <Form.Group className="mb-3">
      <Form.Check
        {...field}
        type="checkbox"
        label={label}
        disabled={disabled}
        isInvalid={meta.touched && !!meta.error}
        feedback={meta.error}
        feedbackType="invalid"
      />
    </Form.Group>
  );
};

export default FormCheckbox;
