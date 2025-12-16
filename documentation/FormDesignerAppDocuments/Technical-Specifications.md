# Form Designer React Application - Technical Specifications

## 1. Introduction

This document provides detailed technical specifications for the Form Designer React Application, including data models, API contracts, component specifications, and implementation details.

---

## 2. Data Models & TypeScript Interfaces

### 2.1 Authentication Models

```typescript
// User Model
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Auth State
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Login Request/Response
interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: number; // seconds
}

// Register Request
interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

// Token Payload (JWT)
interface TokenPayload {
  sub: string; // user id
  email: string;
  roles: string[];
  exp: number;
  iat: number;
}
```

### 2.2 Form Models

```typescript
// Form Definition
interface Form {
  id: string;
  title: string;
  description: string;
  status: FormStatus;
  fields: FormField[];
  settings: FormSettings;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  version: number;
}

enum FormStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

// Form Field
interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  validation?: FieldValidation;
  options?: FieldOption[]; // for select, radio, checkbox
  defaultValue?: any;
  order: number;
  conditionalLogic?: ConditionalLogic;
  metadata?: Record<string, any>;
}

enum FieldType {
  TEXT = 'text',
  EMAIL = 'email',
  NUMBER = 'number',
  PHONE = 'phone',
  DATE = 'date',
  DATETIME = 'datetime',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  RADIO = 'radio',
  CHECKBOX = 'checkbox',
  FILE = 'file',
  SIGNATURE = 'signature',
  RATING = 'rating',
  SECTION = 'section' // for grouping
}

// Field Validation
interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string; // regex
  customMessage?: string;
  custom?: string; // custom validation function name
}

// Field Options (for select, radio, checkbox)
interface FieldOption {
  label: string;
  value: string;
  order: number;
}

// Conditional Logic
interface ConditionalLogic {
  action: 'show' | 'hide' | 'require' | 'skip';
  conditions: Condition[];
  operator: 'AND' | 'OR';
}

interface Condition {
  fieldId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

// Form Settings
interface FormSettings {
  allowMultipleSubmissions: boolean;
  requireAuthentication: boolean;
  showProgressBar: boolean;
  confirmationMessage: string;
  redirectUrl?: string;
  notificationEmails: string[];
  allowSaveDraft: boolean;
  enableCaptcha: boolean;
}
```

### 2.3 Submission Models

```typescript
// Form Submission
interface FormSubmission {
  id: string;
  formId: string;
  formVersion: number;
  submittedBy?: string; // user id if authenticated
  submittedAt: string;
  data: SubmissionData;
  status: SubmissionStatus;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

enum SubmissionStatus {
  COMPLETED = 'completed',
  DRAFT = 'draft',
  PENDING = 'pending'
}

// Submission Data (field id -> value mapping)
type SubmissionData = Record<string, any>;

// Submission Response
interface SubmissionResponse {
  success: boolean;
  submissionId: string;
  message: string;
  redirectUrl?: string;
}
```

### 2.4 User Management Models

```typescript
enum UserRole {
  ADMIN = 'Admin',
  FORM_CREATOR = 'FormCreator',
  FORM_VIEWER = 'FormViewer',
  USER = 'User'
}

interface UserCreateRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles: UserRole[];
}

interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  roles?: UserRole[];
  isActive?: boolean;
}

interface UserListResponse {
  users: User[];
  totalCount: number;
  page: number;
  pageSize: number;
}
```

### 2.5 Pagination & Filtering

```typescript
interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface FilterParams {
  search?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  createdBy?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

---

## 3. API Specifications

### 3.1 Base Configuration

```typescript
const API_CONFIG = {
  baseURL: process.env.VITE_API_BASE_URL || 'https://api.formdesigner.com',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
};
```

### 3.2 Authentication Endpoints

```typescript
// POST /api/auth/login
// Request Body: LoginRequest
// Response: LoginResponse
authAPI.login = (credentials: LoginRequest): Promise<LoginResponse> => {
  return apiClient.post('/api/auth/login', credentials);
};

// POST /api/auth/register
// Request Body: RegisterRequest
// Response: LoginResponse
authAPI.register = (data: RegisterRequest): Promise<LoginResponse> => {
  return apiClient.post('/api/auth/register', data);
};

// POST /api/auth/refresh
// Request Body: { refreshToken: string }
// Response: { token: string, expiresIn: number }
authAPI.refreshToken = (refreshToken: string): Promise<LoginResponse> => {
  return apiClient.post('/api/auth/refresh', { refreshToken });
};

// POST /api/auth/logout
// Request Body: { refreshToken: string }
// Response: { success: boolean }
authAPI.logout = (refreshToken: string): Promise<{ success: boolean }> => {
  return apiClient.post('/api/auth/logout', { refreshToken });
};

// GET /api/auth/me
// Response: User
authAPI.getCurrentUser = (): Promise<User> => {
  return apiClient.get('/api/auth/me');
};

// POST /api/auth/forgot-password
// Request Body: { email: string }
// Response: { message: string }
authAPI.forgotPassword = (email: string): Promise<{ message: string }> => {
  return apiClient.post('/api/auth/forgot-password', { email });
};

// POST /api/auth/reset-password
// Request Body: { token: string, password: string }
// Response: { message: string }
authAPI.resetPassword = (
  token: string,
  password: string
): Promise<{ message: string }> => {
  return apiClient.post('/api/auth/reset-password', { token, password });
};
```

### 3.3 Forms Endpoints

```typescript
// GET /api/forms
// Query Params: PaginationParams & FilterParams
// Response: PaginatedResponse<Form>
formsAPI.getForms = (
  params: PaginationParams & FilterParams
): Promise<PaginatedResponse<Form>> => {
  return apiClient.get('/api/forms', { params });
};

// GET /api/forms/{id}
// Response: Form
formsAPI.getFormById = (id: string): Promise<Form> => {
  return apiClient.get(`/api/forms/${id}`);
};

// POST /api/forms
// Request Body: Omit<Form, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
// Response: Form
formsAPI.createForm = (form: Partial<Form>): Promise<Form> => {
  return apiClient.post('/api/forms', form);
};

// PUT /api/forms/{id}
// Request Body: Partial<Form>
// Response: Form
formsAPI.updateForm = (id: string, form: Partial<Form>): Promise<Form> => {
  return apiClient.put(`/api/forms/${id}`, form);
};

// DELETE /api/forms/{id}
// Response: { success: boolean }
formsAPI.deleteForm = (id: string): Promise<{ success: boolean }> => {
  return apiClient.delete(`/api/forms/${id}`);
};

// POST /api/forms/{id}/publish
// Response: Form
formsAPI.publishForm = (id: string): Promise<Form> => {
  return apiClient.post(`/api/forms/${id}/publish`);
};

// POST /api/forms/{id}/duplicate
// Response: Form
formsAPI.duplicateForm = (id: string): Promise<Form> => {
  return apiClient.post(`/api/forms/${id}/duplicate`);
};

// GET /api/forms/{id}/preview
// Response: Form (without authentication)
formsAPI.getFormPreview = (id: string): Promise<Form> => {
  return apiClient.get(`/api/forms/${id}/preview`);
};
```

### 3.4 Submissions Endpoints

```typescript
// POST /api/forms/{formId}/submissions
// Request Body: SubmissionData
// Response: SubmissionResponse
submissionsAPI.submitForm = (
  formId: string,
  data: SubmissionData
): Promise<SubmissionResponse> => {
  return apiClient.post(`/api/forms/${formId}/submissions`, data);
};

// GET /api/forms/{formId}/submissions
// Query Params: PaginationParams
// Response: PaginatedResponse<FormSubmission>
submissionsAPI.getFormSubmissions = (
  formId: string,
  params: PaginationParams
): Promise<PaginatedResponse<FormSubmission>> => {
  return apiClient.get(`/api/forms/${formId}/submissions`, { params });
};

// GET /api/submissions/{id}
// Response: FormSubmission
submissionsAPI.getSubmissionById = (id: string): Promise<FormSubmission> => {
  return apiClient.get(`/api/submissions/${id}`);
};

// DELETE /api/submissions/{id}
// Response: { success: boolean }
submissionsAPI.deleteSubmission = (
  id: string
): Promise<{ success: boolean }> => {
  return apiClient.delete(`/api/submissions/${id}`);
};

// GET /api/forms/{formId}/submissions/export
// Query Params: { format: 'csv' | 'excel' | 'json' }
// Response: Blob
submissionsAPI.exportSubmissions = (
  formId: string,
  format: 'csv' | 'excel' | 'json'
): Promise<Blob> => {
  return apiClient.get(`/api/forms/${formId}/submissions/export`, {
    params: { format },
    responseType: 'blob'
  });
};
```

### 3.5 Users Endpoints (Admin Only)

```typescript
// GET /api/users
// Query Params: PaginationParams & FilterParams
// Response: UserListResponse
usersAPI.getUsers = (
  params: PaginationParams & FilterParams
): Promise<UserListResponse> => {
  return apiClient.get('/api/users', { params });
};

// GET /api/users/{id}
// Response: User
usersAPI.getUserById = (id: string): Promise<User> => {
  return apiClient.get(`/api/users/${id}`);
};

// POST /api/users
// Request Body: UserCreateRequest
// Response: User
usersAPI.createUser = (user: UserCreateRequest): Promise<User> => {
  return apiClient.post('/api/users', user);
};

// PUT /api/users/{id}
// Request Body: UserUpdateRequest
// Response: User
usersAPI.updateUser = (id: string, user: UserUpdateRequest): Promise<User> => {
  return apiClient.put(`/api/users/${id}`, user);
};

// DELETE /api/users/{id}
// Response: { success: boolean }
usersAPI.deleteUser = (id: string): Promise<{ success: boolean }> => {
  return apiClient.delete(`/api/users/${id}`);
};

// PUT /api/users/{id}/roles
// Request Body: { roles: UserRole[] }
// Response: User
usersAPI.updateUserRoles = (
  id: string,
  roles: UserRole[]
): Promise<User> => {
  return apiClient.put(`/api/users/${id}/roles`, { roles });
};
```

---

## 4. Redux Store Specifications

### 4.1 Auth Slice

```typescript
// features/auth/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { getState }) => {
    const { refreshToken } = getState().auth;
    if (refreshToken) {
      await authAPI.logout(refreshToken);
    }
  }
);

export const refreshAuthToken = createAsyncThunk(
  'auth/refresh',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { refreshToken } = getState().auth;
      if (!refreshToken) throw new Error('No refresh token');
      const response = await authAPI.refreshToken(refreshToken);
      return response;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  } as AuthState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    });
    
    // Add similar cases for register, refresh, etc.
  }
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;
```

### 4.2 Forms Slice

```typescript
// features/forms/slices/formsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface FormsState {
  items: Form[];
  currentForm: Form | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Async thunks
export const fetchForms = createAsyncThunk(
  'forms/fetchForms',
  async (params: PaginationParams & FilterParams) => {
    const response = await formsAPI.getForms(params);
    return response;
  }
);

export const fetchFormById = createAsyncThunk(
  'forms/fetchFormById',
  async (id: string) => {
    const response = await formsAPI.getFormById(id);
    return response;
  }
);

export const createForm = createAsyncThunk(
  'forms/createForm',
  async (form: Partial<Form>) => {
    const response = await formsAPI.createForm(form);
    return response;
  }
);

export const updateForm = createAsyncThunk(
  'forms/updateForm',
  async ({ id, form }: { id: string; form: Partial<Form> }) => {
    const response = await formsAPI.updateForm(id, form);
    return response;
  }
);

export const deleteForm = createAsyncThunk(
  'forms/deleteForm',
  async (id: string) => {
    await formsAPI.deleteForm(id);
    return id;
  }
);

export const publishForm = createAsyncThunk(
  'forms/publishForm',
  async (id: string) => {
    const response = await formsAPI.publishForm(id);
    return response;
  }
);

// Slice
const formsSlice = createSlice({
  name: 'forms',
  initialState: {
    items: [],
    currentForm: null,
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0
    }
  } as FormsState,
  reducers: {
    clearCurrentForm: (state) => {
      state.currentForm = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch forms
    builder.addCase(fetchForms.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchForms.fulfilled, (state, action) => {
      state.isLoading = false;
      state.items = action.payload.data;
      state.pagination = {
        page: action.payload.page,
        pageSize: action.payload.pageSize,
        totalCount: action.payload.totalCount,
        totalPages: action.payload.totalPages
      };
    });
    builder.addCase(fetchForms.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch forms';
    });
    
    // Fetch form by ID
    builder.addCase(fetchFormById.fulfilled, (state, action) => {
      state.currentForm = action.payload;
    });
    
    // Create form
    builder.addCase(createForm.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
      state.currentForm = action.payload;
    });
    
    // Update form
    builder.addCase(updateForm.fulfilled, (state, action) => {
      const index = state.items.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      state.currentForm = action.payload;
    });
    
    // Delete form
    builder.addCase(deleteForm.fulfilled, (state, action) => {
      state.items = state.items.filter(f => f.id !== action.payload);
    });
    
    // Publish form
    builder.addCase(publishForm.fulfilled, (state, action) => {
      const index = state.items.findIndex(f => f.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      state.currentForm = action.payload;
    });
  }
});

export const { clearCurrentForm, clearError } = formsSlice.actions;
export default formsSlice.reducer;
```

---

## 5. Component Specifications

### 5.1 LoginForm Component

```typescript
// features/auth/components/LoginForm.tsx
import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { loginUser } from '../slices/authSlice';

const loginSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required')
});

export const LoginForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (values: LoginRequest) => {
    await dispatch(loginUser(values));
  };

  return (
    <Formik
      initialValues={{ email: '', password: '', rememberMe: false }}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <Field
              type="email"
              name="email"
              className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
              placeholder="Enter your email"
            />
            {errors.email && touched.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <Field
              type="password"
              name="password"
              className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
              placeholder="Enter your password"
            />
            {errors.password && touched.password && (
              <div className="invalid-feedback">{errors.password}</div>
            )}
          </div>

          <div className="mb-3 form-check">
            <Field
              type="checkbox"
              name="rememberMe"
              className="form-check-input"
              id="rememberMe"
            />
            <label className="form-check-label" htmlFor="rememberMe">
              Remember me
            </label>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={isLoading || isSubmitting}
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </Form>
      )}
    </Formik>
  );
};
```

### 5.2 FormBuilder Component (Simplified)

```typescript
// features/forms/components/FormBuilder.tsx
import React, { useState } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { FieldPalette } from './FieldPalette';
import { FormCanvas } from './FormCanvas';
import { FieldEditor } from './FieldEditor';
import { Form, FormField } from '../types';

interface FormBuilderProps {
  initialForm?: Form;
  onSave: (form: Partial<Form>) => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  initialForm,
  onSave
}) => {
  const [form, setForm] = useState<Partial<Form>>(
    initialForm || {
      title: 'Untitled Form',
      description: '',
      fields: [],
      status: FormStatus.DRAFT
    }
  );
  const [selectedField, setSelectedField] = useState<FormField | null>(null);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = form.fields!.findIndex((f) => f.id === active.id);
      const newIndex = form.fields!.findIndex((f) => f.id === over.id);
      
      setForm({
        ...form,
        fields: arrayMove(form.fields!, oldIndex, newIndex)
      });
    }
  };

  const handleAddField = (type: FieldType) => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: `New ${type} field`,
      required: false,
      order: form.fields!.length
    };
    
    setForm({
      ...form,
      fields: [...form.fields!, newField]
    });
  };

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    setForm({
      ...form,
      fields: form.fields!.map((f) =>
        f.id === fieldId ? { ...f, ...updates } : f
      )
    });
  };

  const handleDeleteField = (fieldId: string) => {
    setForm({
      ...form,
      fields: form.fields!.filter((f) => f.id !== fieldId)
    });
    setSelectedField(null);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Container fluid className="form-builder">
        <Row>
          <Col md={3}>
            <FieldPalette onAddField={handleAddField} />
          </Col>
          
          <Col md={6}>
            <FormCanvas
              form={form}
              onSelectField={setSelectedField}
              selectedFieldId={selectedField?.id}
            />
          </Col>
          
          <Col md={3}>
            {selectedField && (
              <FieldEditor
                field={selectedField}
                onUpdate={(updates) =>
                  handleUpdateField(selectedField.id, updates)
                }
                onDelete={() => handleDeleteField(selectedField.id)}
              />
            )}
          </Col>
        </Row>
        
        <div className="form-builder-actions">
          <Button variant="outline-secondary" onClick={() => setSelectedField(null)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onSave(form)}>
            Save Form
          </Button>
        </div>
      </Container>
    </DndContext>
  );
};
```

### 5.3 PrivateRoute Component

```typescript
// routes/PrivateRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

### 5.4 RoleRoute Component

```typescript
// routes/RoleRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { UserRole } from '@/shared/types';

interface RoleRouteProps {
  children: React.ReactNode;
  requiredRole: UserRole | UserRole[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  children,
  requiredRole
}) => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = Array.isArray(requiredRole)
    ? requiredRole.some((role) => user.roles.includes(role))
    : user.roles.includes(requiredRole);

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

---

## 6. Custom Hooks

### 6.1 useAuth Hook

```typescript
// shared/hooks/useAuth.ts
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { loginUser, logoutUser, registerUser } from '@/features/auth/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const result = await dispatch(loginUser(credentials));
      if (loginUser.fulfilled.match(result)) {
        navigate('/app/dashboard');
      }
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutUser());
    navigate('/login');
  }, [dispatch, navigate]);

  const register = useCallback(
    async (data: RegisterRequest) => {
      const result = await dispatch(registerUser(data));
      if (registerUser.fulfilled.match(result)) {
        navigate('/app/dashboard');
      }
    },
    [dispatch, navigate]
  );

  const hasRole = useCallback(
    (role: UserRole) => {
      return auth.user?.roles.includes(role) || false;
    },
    [auth.user]
  );

  const hasAnyRole = useCallback(
    (roles: UserRole[]) => {
      return roles.some((role) => auth.user?.roles.includes(role));
    },
    [auth.user]
  );

  return {
    ...auth,
    login,
    logout,
    register,
    hasRole,
    hasAnyRole
  };
};
```

### 6.2 usePermissions Hook

```typescript
// shared/hooks/usePermissions.ts
import { useMemo } from 'react';
import { useAuth } from './useAuth';

export const usePermissions = () => {
  const { user } = useAuth();

  const permissions = useMemo(() => {
    if (!user) return {};

    const canCreateForms = user.roles.includes(UserRole.ADMIN) ||
      user.roles.includes(UserRole.FORM_CREATOR);
    
    const canManageUsers = user.roles.includes(UserRole.ADMIN);
    
    const canViewSubmissions = user.roles.includes(UserRole.ADMIN) ||
      user.roles.includes(UserRole.FORM_CREATOR) ||
      user.roles.includes(UserRole.FORM_VIEWER);

    return {
      canCreateForms,
      canManageUsers,
      canViewSubmissions,
      canDeleteForms: user.roles.includes(UserRole.ADMIN),
      canPublishForms: canCreateForms
    };
  }, [user]);

  return permissions;
};
```

---

## 7. Utility Functions

### 7.1 Token Management

```typescript
// services/storage/tokenStorage.ts
export const tokenStorage = {
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  removeToken: (): void => {
    localStorage.removeItem('token');
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem('refreshToken');
  },

  setRefreshToken: (token: string): void => {
    localStorage.setItem('refreshToken', token);
  },

  removeRefreshToken: (): void => {
    localStorage.removeItem('refreshToken');
  },

  clearAll: (): void => {
    tokenStorage.removeToken();
    tokenStorage.removeRefreshToken();
  }
};
```

### 7.2 JWT Decoder

```typescript
// shared/utils/jwt.ts
import { TokenPayload } from '@/shared/types';

export const decodeToken = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload) return true;
  
  const currentTime = Date.now() / 1000;
  return payload.exp < currentTime;
};

export const getTokenExpirationTime = (token: string): number | null => {
  const payload = decodeToken(token);
  return payload ? payload.exp * 1000 : null;
};
```

---

## 8. Environment Configuration

```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Form Designer
VITE_TOKEN_REFRESH_INTERVAL=840000
VITE_MAX_FILE_SIZE=5242880
VITE_ENABLE_ANALYTICS=false

// .env.production
VITE_API_BASE_URL=https://api.formdesigner.com
VITE_APP_NAME=Form Designer
VITE_TOKEN_REFRESH_INTERVAL=840000
VITE_MAX_FILE_SIZE=10485760
VITE_ENABLE_ANALYTICS=true
VITE_SENTRY_DSN=your-sentry-dsn
```

---

## 9. Error Handling

### 9.1 Global Error Handler

```typescript
// services/api/errorHandler.ts
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        return data.message || 'Invalid request';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return data.message || 'Conflict occurred.';
      case 422:
        return data.message || 'Validation failed.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data.message || 'An error occurred.';
    }
  } else if (error.request) {
    // No response received
    return 'Network error. Please check your connection.';
  } else {
    // Error in request setup
    return error.message || 'An unexpected error occurred.';
  }
};
```

---

## 10. Validation Schemas

### 10.1 Form Validation

```typescript
// shared/validation/formValidation.ts
import * as Yup from 'yup';

export const formSchema = Yup.object({
  title: Yup.string()
    .required('Form title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must not exceed 100 characters'),
  description: Yup.string()
    .max(500, 'Description must not exceed 500 characters'),
  fields: Yup.array()
    .of(
      Yup.object({
        label: Yup.string().required('Field label is required'),
        type: Yup.string().required('Field type is required')
      })
    )
    .min(1, 'Form must have at least one field')
});

export const fieldValidationSchema = Yup.object({
  label: Yup.string()
    .required('Label is required')
    .max(100, 'Label must not exceed 100 characters'),
  placeholder: Yup.string()
    .max(150, 'Placeholder must not exceed 150 characters'),
  helpText: Yup.string()
    .max(250, 'Help text must not exceed 250 characters')
});
```

---

This technical specification provides the detailed implementation contracts for building the Form Designer React Application. Each section should be referenced during development to ensure consistency and adherence to the architecture.

### 2.9 PDF Intelligence & Code Generation Models

```typescript
// Project Model
interface FormProject {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  
  // PDF Information
  originalPdfUrl?: string;
  originalPdfFileName?: string;
  originalPdfSize?: number;
  
  // Document Intelligence
  documentIntelligenceJobId?: string;
  documentIntelligenceStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  documentIntelligenceResult?: DocumentIntelligenceResult;
  
  // Form Definition
  formDefinition?: FormDefinition;
  
  // Code Generation
  codeGenerationJobId?: string;
  codeGenerationStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  generatedCode?: GeneratedCodeArtifacts;
  selectedTemplate?: string;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

enum ProjectStatus {
  DRAFT = 'draft',
  PDF_UPLOADED = 'pdf_uploaded',
  ANALYZING = 'analyzing',
  ANALYSIS_COMPLETE = 'analysis_complete',
  STRUCTURE_REVIEWED = 'structure_reviewed',
  GENERATING_CODE = 'generating_code',
  CODE_GENERATED = 'code_generated'
}

// Document Intelligence
interface DocumentIntelligenceResult {
  jobId: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  formStructure: ExtractedFormStructure;
  overallConfidence?: number;
}

interface ExtractedFormStructure {
  title?: string;
  pages: PageStructure[];
  fields: ExtractedField[];
  sections?: FormSection[];
}

interface ExtractedField {
  id: string;
  label: string;
  type: FieldType;
  page: number;
  boundingBox: BoundingBox;
  required?: boolean;
  confidence: number;
}

// Code Generation
interface GeneratedCodeArtifacts {
  jobId: string;
  generatedAt: string;
  frontend: {
    component: GeneratedFile;
    types?: GeneratedFile;
    styles?: GeneratedFile;
    validationSchema?: GeneratedFile;
  };
  backend?: {
    controller?: GeneratedFile;
    service?: GeneratedFile;
    dto?: GeneratedFile;
    entity?: GeneratedFile;
  };
  downloadUrl?: string;
}

interface GeneratedFile {
  filename: string;
  content: string;
  language: string;
  size: number;
}

interface CodeTemplate {
  id: string;
  name: string;
  description: string;
  framework: string;
  supportsValidation: boolean;
  supportsConditionalLogic: boolean;
}
```

