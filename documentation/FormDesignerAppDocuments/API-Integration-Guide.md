# Form Designer React Application - API Integration Guide

## 1. Introduction

This document provides comprehensive guidance for integrating the React frontend with the FormDesignerAPI backend. It includes endpoint specifications, request/response formats, authentication requirements, and error handling.

---

## 2. API Base Configuration

### 2.1 Base URL

```typescript
// Development
const API_BASE_URL = 'http://localhost:5000';

// Production
const API_BASE_URL = 'https://api.formdesigner.com';
```

### 2.2 Default Headers

```typescript
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Authorization': 'Bearer {token}' // When authenticated
}
```

---

## 3. Authentication Endpoints

### 3.1 Login

**Endpoint**: `POST /api/auth/login`

**Description**: Authenticate a user and receive JWT tokens

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

**Success Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["User", "FormCreator"],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Responses**:
```json
// 400 Bad Request - Invalid credentials
{
  "message": "Invalid email or password",
  "errors": {
    "email": ["Invalid email format"],
    "password": ["Password is required"]
  }
}

// 401 Unauthorized - Account locked
{
  "message": "Account is locked due to multiple failed login attempts"
}

// 403 Forbidden - Account inactive
{
  "message": "Account is not active. Please contact administrator."
}
```

**Implementation**:
```typescript
// services/api/endpoints/auth.ts
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  }
};
```

---

### 3.2 Register

**Endpoint**: `POST /api/auth/register`

**Description**: Register a new user account

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Success Response** (201 Created):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600,
  "user": {
    "id": "456e7890-e89b-12d3-a456-426614174001",
    "email": "newuser@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "roles": ["User"],
    "isActive": true,
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

**Error Responses**:
```json
// 400 Bad Request - Validation errors
{
  "message": "Validation failed",
  "errors": {
    "email": ["Email is already registered"],
    "password": ["Password must be at least 8 characters"],
    "confirmPassword": ["Passwords do not match"]
  }
}

// 409 Conflict - Email exists
{
  "message": "An account with this email already exists"
}
```

---

### 3.3 Refresh Token

**Endpoint**: `POST /api/auth/refresh`

**Description**: Refresh the access token using a refresh token

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Error Responses**:
```json
// 401 Unauthorized - Invalid refresh token
{
  "message": "Invalid or expired refresh token"
}
```

---

### 3.4 Logout

**Endpoint**: `POST /api/auth/logout`

**Description**: Invalidate the refresh token

**Request Headers**:
```
Authorization: Bearer {token}
```

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 3.5 Get Current User

**Endpoint**: `GET /api/auth/me`

**Description**: Get the currently authenticated user's information

**Request Headers**:
```
Authorization: Bearer {token}
```

**Success Response** (200 OK):
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["User", "FormCreator"],
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",
  "lastLoginAt": "2024-01-15T14:30:00Z"
}
```

---

### 3.6 Forgot Password

**Endpoint**: `POST /api/auth/forgot-password`

**Description**: Request a password reset email

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Password reset instructions have been sent to your email"
}
```

---

### 3.7 Reset Password

**Endpoint**: `POST /api/auth/reset-password`

**Description**: Reset password using a token from email

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Success Response** (200 OK):
```json
{
  "message": "Password has been reset successfully"
}
```

---

## 4. Forms Endpoints

### 4.1 Get Forms (List)

**Endpoint**: `GET /api/forms`

**Description**: Retrieve a paginated list of forms

**Request Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
```
page: number (default: 1)
pageSize: number (default: 10, max: 100)
sortBy: string (default: 'createdAt')
sortOrder: 'asc' | 'desc' (default: 'desc')
search: string (optional)
status: 'draft' | 'published' | 'archived' (optional)
createdBy: string (optional)
dateFrom: ISO date string (optional)
dateTo: ISO date string (optional)
```

**Example Request**:
```
GET /api/forms?page=1&pageSize=10&status=published&sortBy=title&sortOrder=asc
```

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "form-123",
      "title": "Customer Feedback Form",
      "description": "Collect customer feedback",
      "status": "published",
      "fieldsCount": 8,
      "submissionsCount": 245,
      "createdBy": "user-456",
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-12T15:30:00Z",
      "publishedAt": "2024-01-12T16:00:00Z",
      "version": 2
    }
  ],
  "totalCount": 50,
  "page": 1,
  "pageSize": 10,
  "totalPages": 5
}
```

**Implementation**:
```typescript
export const formsAPI = {
  getForms: async (params: PaginationParams & FilterParams) => {
    const response = await apiClient.get('/api/forms', { params });
    return response.data;
  }
};
```

---

### 4.2 Get Form by ID

**Endpoint**: `GET /api/forms/{id}`

**Description**: Retrieve a specific form with all fields and settings

**Request Headers**:
```
Authorization: Bearer {token}
```

**Success Response** (200 OK):
```json
{
  "id": "form-123",
  "title": "Customer Feedback Form",
  "description": "Please provide your feedback",
  "status": "published",
  "fields": [
    {
      "id": "field-1",
      "type": "text",
      "label": "Full Name",
      "placeholder": "Enter your full name",
      "required": true,
      "order": 0,
      "validation": {
        "minLength": 2,
        "maxLength": 100
      }
    },
    {
      "id": "field-2",
      "type": "email",
      "label": "Email Address",
      "required": true,
      "order": 1,
      "validation": {
        "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
      }
    },
    {
      "id": "field-3",
      "type": "rating",
      "label": "Overall Satisfaction",
      "required": true,
      "order": 2,
      "validation": {
        "min": 1,
        "max": 5
      }
    }
  ],
  "settings": {
    "allowMultipleSubmissions": false,
    "requireAuthentication": false,
    "showProgressBar": true,
    "confirmationMessage": "Thank you for your feedback!",
    "notificationEmails": ["admin@company.com"],
    "allowSaveDraft": false,
    "enableCaptcha": true
  },
  "createdBy": "user-456",
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-12T15:30:00Z",
  "publishedAt": "2024-01-12T16:00:00Z",
  "version": 2
}
```

**Error Responses**:
```json
// 404 Not Found
{
  "message": "Form not found"
}

// 403 Forbidden
{
  "message": "You do not have permission to view this form"
}
```

---

### 4.3 Create Form

**Endpoint**: `POST /api/forms`

**Description**: Create a new form

**Request Headers**:
```
Authorization: Bearer {token}
```

**Required Roles**: `Admin`, `FormCreator`

**Request Body**:
```json
{
  "title": "Employee Survey",
  "description": "Annual employee satisfaction survey",
  "status": "draft",
  "fields": [
    {
      "type": "text",
      "label": "Employee ID",
      "required": true,
      "order": 0
    },
    {
      "type": "select",
      "label": "Department",
      "required": true,
      "options": [
        { "label": "Engineering", "value": "eng", "order": 0 },
        { "label": "Marketing", "value": "mkt", "order": 1 }
      ],
      "order": 1
    }
  ],
  "settings": {
    "allowMultipleSubmissions": false,
    "requireAuthentication": true,
    "showProgressBar": true,
    "confirmationMessage": "Thank you for completing the survey"
  }
}
```

**Success Response** (201 Created):
```json
{
  "id": "form-789",
  "title": "Employee Survey",
  "description": "Annual employee satisfaction survey",
  "status": "draft",
  "fields": [...],
  "settings": {...},
  "createdBy": "current-user-id",
  "createdAt": "2024-01-15T16:00:00Z",
  "updatedAt": "2024-01-15T16:00:00Z",
  "version": 1
}
```

**Error Responses**:
```json
// 400 Bad Request - Validation errors
{
  "message": "Validation failed",
  "errors": {
    "title": ["Title is required"],
    "fields": ["At least one field is required"]
  }
}

// 403 Forbidden
{
  "message": "You do not have permission to create forms"
}
```

---

### 4.4 Update Form

**Endpoint**: `PUT /api/forms/{id}`

**Description**: Update an existing form

**Request Headers**:
```
Authorization: Bearer {token}
```

**Required Roles**: `Admin`, `FormCreator` (own forms only)

**Request Body**: (Partial update allowed)
```json
{
  "title": "Updated Form Title",
  "description": "Updated description",
  "fields": [...]
}
```

**Success Response** (200 OK):
```json
{
  "id": "form-123",
  "title": "Updated Form Title",
  "description": "Updated description",
  // ... full form object
  "updatedAt": "2024-01-15T17:00:00Z",
  "version": 3
}
```

---

### 4.5 Delete Form

**Endpoint**: `DELETE /api/forms/{id}`

**Description**: Delete a form (soft delete)

**Request Headers**:
```
Authorization: Bearer {token}
```

**Required Roles**: `Admin`, `FormCreator` (own forms only)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Form deleted successfully"
}
```

**Error Responses**:
```json
// 403 Forbidden
{
  "message": "You do not have permission to delete this form"
}

// 409 Conflict - Form has submissions
{
  "message": "Cannot delete form with existing submissions. Archive it instead."
}
```

---

### 4.6 Publish Form

**Endpoint**: `POST /api/forms/{id}/publish`

**Description**: Publish a draft form

**Request Headers**:
```
Authorization: Bearer {token}
```

**Required Roles**: `Admin`, `FormCreator`

**Success Response** (200 OK):
```json
{
  "id": "form-123",
  "status": "published",
  "publishedAt": "2024-01-15T18:00:00Z",
  // ... full form object
}
```

**Error Responses**:
```json
// 400 Bad Request - Invalid form state
{
  "message": "Form must have at least one field to be published"
}
```

---

### 4.7 Duplicate Form

**Endpoint**: `POST /api/forms/{id}/duplicate`

**Description**: Create a copy of an existing form

**Request Headers**:
```
Authorization: Bearer {token}
```

**Success Response** (201 Created):
```json
{
  "id": "form-new-id",
  "title": "Copy of Customer Feedback Form",
  "status": "draft",
  // ... duplicated form data
}
```

---

### 4.8 Get Form Preview (Public)

**Endpoint**: `GET /api/forms/{id}/preview`

**Description**: Get form for public viewing/submission (no authentication required)

**Success Response** (200 OK):
```json
{
  "id": "form-123",
  "title": "Customer Feedback Form",
  "description": "Please provide your feedback",
  "fields": [...],
  "settings": {
    "showProgressBar": true,
    "enableCaptcha": true
  }
  // Only includes fields needed for rendering
}
```

---

## 5. Submissions Endpoints

### 5.1 Submit Form

**Endpoint**: `POST /api/forms/{formId}/submissions`

**Description**: Submit a form response

**Request Headers** (optional):
```
Authorization: Bearer {token}  // If authentication required
```

**Request Body**:
```json
{
  "data": {
    "field-1": "John Doe",
    "field-2": "john@example.com",
    "field-3": 5,
    "field-4": ["option1", "option2"]
  }
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "submissionId": "sub-456",
  "message": "Form submitted successfully",
  "redirectUrl": "https://thankyou.com"  // If configured
}
```

**Error Responses**:
```json
// 400 Bad Request - Validation errors
{
  "message": "Validation failed",
  "errors": {
    "field-1": ["This field is required"],
    "field-2": ["Invalid email format"]
  }
}

// 403 Forbidden - Multiple submissions not allowed
{
  "message": "You have already submitted this form"
}

// 404 Not Found - Form not published
{
  "message": "Form not found or not available"
}
```

---

### 5.2 Get Form Submissions

**Endpoint**: `GET /api/forms/{formId}/submissions`

**Description**: Get all submissions for a form

**Request Headers**:
```
Authorization: Bearer {token}
```

**Required Roles**: `Admin`, `FormCreator`, `FormViewer`

**Query Parameters**:
```
page: number
pageSize: number
sortBy: string (default: 'submittedAt')
sortOrder: 'asc' | 'desc'
dateFrom: ISO date string
dateTo: ISO date string
status: 'completed' | 'draft' | 'pending'
```

**Success Response** (200 OK):
```json
{
  "data": [
    {
      "id": "sub-456",
      "formId": "form-123",
      "formVersion": 2,
      "submittedBy": "user-789",  // null if anonymous
      "submittedAt": "2024-01-15T14:30:00Z",
      "status": "completed",
      "data": {
        "field-1": "John Doe",
        "field-2": "john@example.com",
        "field-3": 5
      }
    }
  ],
  "totalCount": 245,
  "page": 1,
  "pageSize": 10,
  "totalPages": 25
}
```

---

### 5.3 Get Submission by ID

**Endpoint**: `GET /api/submissions/{id}`

**Description**: Get a specific submission

**Request Headers**:
```
Authorization: Bearer {token}
```

**Success Response** (200 OK):
```json
{
  "id": "sub-456",
  "formId": "form-123",
  "formVersion": 2,
  "submittedBy": "user-789",
  "submittedAt": "2024-01-15T14:30:00Z",
  "status": "completed",
  "data": {
    "field-1": "John Doe",
    "field-2": "john@example.com",
    "field-3": 5
  },
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "metadata": {
    "referrer": "https://example.com",
    "deviceType": "desktop"
  }
}
```

---

### 5.4 Delete Submission

**Endpoint**: `DELETE /api/submissions/{id}`

**Description**: Delete a submission

**Request Headers**:
```
Authorization: Bearer {token}
```

**Required Roles**: `Admin`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Submission deleted successfully"
}
```

---

### 5.5 Export Submissions

**Endpoint**: `GET /api/forms/{formId}/submissions/export`

**Description**: Export submissions in various formats

**Request Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
```
format: 'csv' | 'excel' | 'json'
dateFrom: ISO date string (optional)
dateTo: ISO date string (optional)
```

**Success Response** (200 OK):
```
Content-Type: application/vnd.ms-excel  // or text/csv, application/json
Content-Disposition: attachment; filename="submissions-2024-01-15.xlsx"

[Binary file data]
```

---

## 6. Users Endpoints (Admin Only)

### 6.1 Get Users

**Endpoint**: `GET /api/users`

**Description**: Get paginated list of users

**Request Headers**:
```
Authorization: Bearer {token}
```

**Required Roles**: `Admin`

**Query Parameters**:
```
page: number
pageSize: number
search: string
role: string
isActive: boolean
sortBy: string
sortOrder: 'asc' | 'desc'
```

**Success Response** (200 OK):
```json
{
  "users": [
    {
      "id": "user-123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["User", "FormCreator"],
      "isActive": true,
      "createdAt": "2024-01-10T10:00:00Z",
      "updatedAt": "2024-01-15T12:00:00Z",
      "lastLoginAt": "2024-01-15T14:00:00Z"
    }
  ],
  "totalCount": 150,
  "page": 1,
  "pageSize": 10
}
```

---

### 6.2 Get User by ID

**Endpoint**: `GET /api/users/{id}`

**Request Headers**:
```
Authorization: Bearer {token}
```

**Required Roles**: `Admin`

**Success Response** (200 OK):
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": ["User", "FormCreator"],
  "isActive": true,
  "createdAt": "2024-01-10T10:00:00Z",
  "updatedAt": "2024-01-15T12:00:00Z",
  "lastLoginAt": "2024-01-15T14:00:00Z"
}
```

---

### 6.3 Create User

**Endpoint**: `POST /api/users`

**Request Headers**:
```
Authorization: Bearer {token}
```

**Required Roles**: `Admin`

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "roles": ["User", "FormViewer"]
}
```

**Success Response** (201 Created):
```json
{
  "id": "user-new-id",
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "roles": ["User", "FormViewer"],
  "isActive": true,
  "createdAt": "2024-01-15T16:00:00Z"
}
```

---

### 6.4 Update User

**Endpoint**: `PUT /api/users/{id}`

**Request Headers**:
```
Authorization: Bearer {token}
```

**Required Roles**: `Admin`

**Request Body**:
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "isActive": true
}
```

**Success Response** (200 OK):
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "roles": ["User", "FormCreator"],
  "isActive": true,
  "updatedAt": "2024-01-15T17:00:00Z"
}
```

---

### 6.5 Update User Roles

**Endpoint**: `PUT /api/users/{id}/roles`

**Request Headers**:
```
Authorization: Bearer {token}
```

**Required Roles**: `Admin`

**Request Body**:
```json
{
  "roles": ["User", "FormCreator", "Admin"]
}
```

**Success Response** (200 OK):
```json
{
  "id": "user-123",
  "roles": ["User", "FormCreator", "Admin"],
  "updatedAt": "2024-01-15T17:00:00Z"
}
```

---

### 6.6 Delete User

**Endpoint**: `DELETE /api/users/{id}`

**Request Headers**:
```
Authorization: Bearer {token}
```

**Required Roles**: `Admin`

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## 7. Error Response Format

All error responses follow this standard format:

```json
{
  "message": "Human-readable error message",
  "errors": {  // Optional, for validation errors
    "fieldName": ["Error message 1", "Error message 2"]
  },
  "statusCode": 400,
  "timestamp": "2024-01-15T18:00:00Z",
  "path": "/api/forms",
  "traceId": "abc-123-def-456"  // For debugging
}
```

---

## 8. HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE with no response body |
| 400 | Bad Request | Validation errors, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource, business rule violation |
| 422 | Unprocessable Entity | Semantic errors in request |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Server temporarily unavailable |

---

## 9. Rate Limiting

**Limits**:
- Authenticated users: 1000 requests/hour
- Anonymous users: 100 requests/hour
- Form submissions: 10 submissions/minute per IP

**Rate Limit Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705338000  // Unix timestamp
```

**Rate Limit Exceeded Response** (429):
```json
{
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 3600  // Seconds until reset
}
```

---

## 10. Pagination

**Request**:
```
GET /api/forms?page=2&pageSize=20
```

**Response**:
```json
{
  "data": [...],
  "totalCount": 100,
  "page": 2,
  "pageSize": 20,
  "totalPages": 5
}
```

**Pagination Metadata in Headers** (optional):
```
X-Total-Count: 100
X-Page: 2
X-Page-Size: 20
X-Total-Pages: 5
```

---

## 11. API Versioning

The API uses URI versioning:

```
/api/v1/forms
/api/v2/forms
```

Current version: `v1` (default if version not specified)

---

## 12. Testing the API

### Using cURL

```bash
# Login
curl -X POST https://api.formdesigner.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get Forms (with token)
curl -X GET https://api.formdesigner.com/api/forms \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create Form
curl -X POST https://api.formdesigner.com/api/forms \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Form","description":"Test","fields":[...]}'
```

### Using Postman

1. Import the API collection (if provided)
2. Set environment variables:
   - `baseUrl`: API base URL
   - `token`: Authentication token
3. Use collection pre-request scripts for automatic token handling

---

## 13. WebSocket Support (Future)

For real-time features (future enhancement):

**Endpoint**: `wss://api.formdesigner.com/ws`

**Connection**:
```javascript
const ws = new WebSocket('wss://api.formdesigner.com/ws?token=YOUR_TOKEN');
```

**Events**:
- `form.updated`: Form was updated
- `submission.received`: New submission received
- `user.activity`: User activity notification

---

This API integration guide provides all necessary information to successfully integrate the React frontend with the FormDesignerAPI backend. Refer to the Technical Specifications document for TypeScript interfaces that correspond to these API contracts.
