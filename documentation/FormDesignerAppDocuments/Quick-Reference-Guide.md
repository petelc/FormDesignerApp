# Form Designer React Application - Quick Reference Guide

## Quick Links

- **Solution Architecture**: `Solution-Architecture-Document.md`
- **Technical Specifications**: `Technical-Specifications.md`
- **Implementation Plan**: `Implementation-Plan.md`
- **Architecture Diagrams**: `Architecture-Diagrams.md`

---

## Development Quick Start

### 1. Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd form-designer-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.development

# Start development server
npm run dev
```

### 2. Environment Variables

```env
# .env.development
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Form Designer
VITE_TOKEN_REFRESH_INTERVAL=840000
VITE_MAX_FILE_SIZE=5242880
```

---

## Project Structure

```
form-designer-app/
├── src/
│   ├── app/                    # Redux store configuration
│   ├── features/               # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── forms/             # Forms management
│   │   ├── submissions/       # Form submissions
│   │   └── users/             # User management
│   ├── shared/                # Shared resources
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utility functions
│   │   └── types/             # TypeScript types
│   ├── services/              # API services
│   ├── routes/                # Route configuration
│   └── styles/                # Global styles
```

---

## Common Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Code Quality
npm run lint                   # Run ESLint
npm run lint:fix              # Fix ESLint issues
npm run format                # Format with Prettier

# Testing
npm run test                   # Run unit tests
npm run test:watch            # Run tests in watch mode
npm run test:coverage         # Run tests with coverage
npm run test:e2e              # Run E2E tests
```

---

## Key Technologies

| Technology | Purpose | Documentation |
|------------|---------|---------------|
| React 18 | UI Library | https://react.dev |
| TypeScript | Type Safety | https://www.typescriptlang.org |
| Redux Toolkit | State Management | https://redux-toolkit.js.org |
| React Router | Routing | https://reactrouter.com |
| React Bootstrap | UI Components | https://react-bootstrap.github.io |
| Formik | Form Handling | https://formik.org |
| Axios | HTTP Client | https://axios-http.com |

---

## Redux Store Usage

### Accessing State

```typescript
import { useAppSelector } from '@/app/hooks';

const MyComponent = () => {
  const user = useAppSelector((state) => state.auth.user);
  const forms = useAppSelector((state) => state.forms.items);
  
  return <div>{user?.firstName}</div>;
};
```

### Dispatching Actions

```typescript
import { useAppDispatch } from '@/app/hooks';
import { loginUser } from '@/features/auth/slices/authSlice';

const LoginComponent = () => {
  const dispatch = useAppDispatch();
  
  const handleLogin = async (credentials) => {
    await dispatch(loginUser(credentials));
  };
  
  return <button onClick={() => handleLogin({email, password})}>Login</button>;
};
```

---

## API Integration

### Making API Calls

```typescript
// features/forms/services/api.ts
import { apiClient } from '@/services/api/client';

export const formsAPI = {
  getForms: async (params: PaginationParams) => {
    const response = await apiClient.get('/api/forms', { params });
    return response.data;
  },
  
  createForm: async (form: Partial<Form>) => {
    const response = await apiClient.post('/api/forms', form);
    return response.data;
  }
};
```

### Using in Redux Thunks

```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { formsAPI } from '../services/api';

export const fetchForms = createAsyncThunk(
  'forms/fetchForms',
  async (params: PaginationParams) => {
    return await formsAPI.getForms(params);
  }
);
```

---

## Common Patterns

### 1. Protected Route

```typescript
import { PrivateRoute } from '@/routes/PrivateRoute';

<Route 
  path="/dashboard" 
  element={
    <PrivateRoute>
      <DashboardPage />
    </PrivateRoute>
  } 
/>
```

### 2. Role-Based Route

```typescript
import { RoleRoute } from '@/routes/RoleRoute';

<Route 
  path="/users" 
  element={
    <RoleRoute requiredRole={UserRole.ADMIN}>
      <UserManagementPage />
    </RoleRoute>
  } 
/>
```

### 3. Custom Hook Usage

```typescript
import { useAuth } from '@/shared/hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <button onClick={login}>Login</button>;
  }
  
  return <div>Welcome, {user.firstName}!</div>;
};
```

### 4. Form with Validation

```typescript
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

const schema = Yup.object({
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required()
});

<Formik
  initialValues={{ email: '', password: '' }}
  validationSchema={schema}
  onSubmit={handleSubmit}
>
  {({ errors, touched }) => (
    <Form>
      <Field name="email" className="form-control" />
      {errors.email && touched.email && <div>{errors.email}</div>}
    </Form>
  )}
</Formik>
```

---

## Styling Guidelines

### Using Bootstrap Classes

```tsx
import { Button, Card, Container } from 'react-bootstrap';

<Container>
  <Card>
    <Card.Body>
      <Card.Title>My Card</Card.Title>
      <Button variant="primary">Click Me</Button>
    </Card.Body>
  </Card>
</Container>
```

### Custom Styles

```tsx
// Component.module.scss
.myComponent {
  padding: 1rem;
  
  &__title {
    font-size: 1.5rem;
    color: var(--bs-primary);
  }
}

// Component.tsx
import styles from './Component.module.scss';

<div className={styles.myComponent}>
  <h1 className={styles.myComponent__title}>Title</h1>
</div>
```

---

## Testing Patterns

### Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });
  
  it('submits form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

### Redux Slice Test

```typescript
import authReducer, { loginUser } from './authSlice';

describe('authSlice', () => {
  it('should handle login success', () => {
    const previousState = { user: null, isAuthenticated: false };
    const action = { type: loginUser.fulfilled.type, payload: { user, token } };
    const state = authReducer(previousState, action);
    
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });
});
```

---

## Performance Tips

### 1. Code Splitting

```typescript
import { lazy, Suspense } from 'react';

const FormBuilder = lazy(() => import('./features/forms/pages/FormBuilder'));

<Suspense fallback={<LoadingSpinner />}>
  <FormBuilder />
</Suspense>
```

### 2. Memoization

```typescript
import { useMemo, useCallback } from 'react';

const MyComponent = ({ data }) => {
  // Expensive calculation
  const processedData = useMemo(() => {
    return data.map(/* expensive operation */);
  }, [data]);
  
  // Callback function
  const handleClick = useCallback(() => {
    // handle click
  }, [/* dependencies */]);
  
  return <div onClick={handleClick}>{processedData}</div>;
};
```

### 3. React.memo

```typescript
import { memo } from 'react';

const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* expensive render */}</div>;
});
```

---

## Debugging Tips

### Redux DevTools

1. Install Redux DevTools extension
2. Use time-travel debugging
3. Inspect state changes
4. Replay actions

### React DevTools

1. Install React DevTools extension
2. Inspect component tree
3. View props and state
4. Profile performance

### Network Debugging

```typescript
// services/api/client.ts
apiClient.interceptors.request.use((config) => {
  console.log('Request:', config.method, config.url, config.data);
  return config;
});

apiClient.interceptors.response.use((response) => {
  console.log('Response:', response.status, response.data);
  return response;
});
```

---

## Common Issues & Solutions

### Issue: CORS Error

**Solution**: Ensure API has correct CORS headers configured

```typescript
// Backend should have:
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
```

### Issue: Token Expired

**Solution**: Implement automatic token refresh

```typescript
// services/api/interceptors.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Attempt token refresh
      const newToken = await refreshToken();
      // Retry original request with new token
    }
    return Promise.reject(error);
  }
);
```

### Issue: State Not Updating

**Solution**: Ensure you're not mutating state directly

```typescript
// ❌ Wrong
state.items.push(newItem);

// ✅ Correct
state.items = [...state.items, newItem];
```

---

## Code Style Guidelines

### TypeScript

```typescript
// Use explicit types
interface User {
  id: string;
  name: string;
  email: string;
}

// Avoid 'any'
const getUser = (): User => { /* ... */ };

// Use union types
type Status = 'idle' | 'loading' | 'success' | 'error';
```

### Component Structure

```typescript
// 1. Imports
import React from 'react';
import { useAppSelector } from '@/app/hooks';

// 2. Types/Interfaces
interface Props {
  title: string;
}

// 3. Component
export const MyComponent: React.FC<Props> = ({ title }) => {
  // 4. Hooks
  const user = useAppSelector((state) => state.auth.user);
  
  // 5. Handlers
  const handleClick = () => { /* ... */ };
  
  // 6. Render
  return <div onClick={handleClick}>{title}</div>;
};
```

### Naming Conventions

- Components: PascalCase (`LoginForm.tsx`)
- Functions: camelCase (`handleSubmit`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Interfaces: PascalCase with 'I' prefix optional (`User` or `IUser`)
- Types: PascalCase (`UserRole`)

---

## Git Workflow

### Branch Naming

```bash
feature/add-login-form
bugfix/fix-form-validation
hotfix/critical-security-patch
```

### Commit Messages

```bash
feat: add login form component
fix: resolve form validation issue
docs: update API documentation
test: add tests for auth slice
refactor: improve code structure
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push branch and create PR
4. Request code review
5. Address feedback
6. Merge to `develop`

---

## Useful Resources

### Documentation

- **React**: https://react.dev
- **TypeScript**: https://www.typescriptlang.org/docs
- **Redux Toolkit**: https://redux-toolkit.js.org
- **React Router**: https://reactrouter.com
- **Bootstrap**: https://getbootstrap.com

### Tools

- **VS Code Extensions**:
  - ESLint
  - Prettier
  - TypeScript
  - Redux DevTools
  - GitLens

### Learning Resources

- React Beta Docs: https://react.dev
- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook
- Redux Essentials: https://redux.js.org/tutorials/essentials/part-1-overview-concepts

---

## Getting Help

### Documentation

Check the project documentation in the `/docs` folder:
- Solution Architecture Document
- Technical Specifications
- Implementation Plan

### Team Communication

- Slack: #form-designer-dev
- Email: dev-team@company.com
- Daily Standup: 9:00 AM

### Code Reviews

- Submit PR with detailed description
- Tag relevant reviewers
- Respond to feedback promptly
- Update PR based on comments

---

## Cheat Sheet

### Redux

```typescript
// Select state
const value = useAppSelector((state) => state.feature.value);

// Dispatch action
const dispatch = useAppDispatch();
dispatch(actionCreator(payload));

// Async thunk
export const fetchData = createAsyncThunk('feature/fetch', async () => {
  return await api.getData();
});
```

### Routing

```typescript
// Navigate programmatically
const navigate = useNavigate();
navigate('/path');

// Get params
const { id } = useParams();

// Get query params
const [searchParams] = useSearchParams();
const query = searchParams.get('q');
```

### Forms

```typescript
// Formik
<Formik
  initialValues={{ field: '' }}
  validationSchema={schema}
  onSubmit={handleSubmit}
>
  <Form>
    <Field name="field" />
    <ErrorMessage name="field" />
  </Form>
</Formik>
```

---

This quick reference guide should help developers get started quickly and find common patterns and solutions throughout the development process.
