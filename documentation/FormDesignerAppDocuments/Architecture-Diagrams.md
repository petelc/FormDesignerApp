# Form Designer React Application - Architecture Diagrams

This document contains Mermaid diagrams that visualize the architecture, flows, and structure of the Form Designer React Application.

---

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end
    
    subgraph "React Application"
        Router[React Router]
        Redux[Redux Store]
        
        subgraph "Features"
            Auth[Auth Module]
            Forms[Forms Module]
            Submissions[Submissions Module]
            Users[Users Module]
        end
        
        subgraph "Shared"
            Components[UI Components]
            Hooks[Custom Hooks]
            Utils[Utilities]
        end
        
        Services[API Services]
    end
    
    subgraph "Backend API"
        API[FormDesignerAPI]
        Identity[Identity Service]
        DB[(Database)]
    end
    
    Browser --> Router
    Mobile --> Router
    Router --> Auth
    Router --> Forms
    Router --> Submissions
    Router --> Users
    
    Auth --> Redux
    Forms --> Redux
    Submissions --> Redux
    Users --> Redux
    
    Auth --> Services
    Forms --> Services
    Submissions --> Services
    Users --> Services
    
    Services --> API
    API --> Identity
    API --> DB
    
    Auth --> Components
    Forms --> Components
    Submissions --> Components
    Users --> Components
    
    Components --> Hooks
    Components --> Utils
```

---

## 2. Authentication Flow Diagram

```mermaid
sequenceDiagram
    actor User
    participant UI as Login Page
    participant Redux as Redux Store
    participant API as API Service
    participant Backend as FormDesignerAPI
    participant Identity as Identity Service
    
    User->>UI: Enter credentials
    UI->>Redux: dispatch(loginUser)
    Redux->>API: POST /api/auth/login
    API->>Backend: Login request
    Backend->>Identity: Validate credentials
    Identity-->>Backend: User + Roles
    Backend-->>API: JWT + RefreshToken
    API-->>Redux: Store tokens
    Redux->>Redux: Update auth state
    Redux-->>UI: Login successful
    UI->>UI: Redirect to dashboard
    UI-->>User: Dashboard view
    
    Note over Redux,API: Token stored in memory
    Note over API: Interceptor adds token to requests
```

---

## 3. Token Refresh Flow

```mermaid
sequenceDiagram
    participant App as React App
    participant Redux as Redux Store
    participant API as API Service
    participant Backend as FormDesignerAPI
    
    App->>API: API Request with expired token
    API->>Backend: Request
    Backend-->>API: 401 Unauthorized
    API->>API: Detect token expired
    API->>Redux: Get refresh token
    Redux-->>API: Refresh token
    API->>Backend: POST /api/auth/refresh
    Backend-->>API: New access token
    API->>Redux: Update token
    API->>Backend: Retry original request
    Backend-->>API: Success response
    API-->>App: Return data
    
    alt Refresh token expired
        Backend-->>API: 401 Unauthorized
        API->>Redux: Clear auth state
        API->>App: Redirect to login
    end
```

---

## 4. Form Builder Component Architecture

```mermaid
graph TB
    subgraph "Form Builder Page"
        FB[FormBuilder Component]
        
        subgraph "Left Panel"
            FP[FieldPalette]
            FP1[Text Fields]
            FP2[Selection Fields]
            FP3[Special Fields]
        end
        
        subgraph "Center Canvas"
            FC[FormCanvas]
            FL[Field List]
            FI[Field Items]
        end
        
        subgraph "Right Panel"
            FE[FieldEditor]
            FE1[Properties]
            FE2[Validation]
            FE3[Options]
            FE4[Logic]
        end
        
        Actions[Action Buttons]
    end
    
    FB --> FP
    FB --> FC
    FB --> FE
    FB --> Actions
    
    FP --> FP1
    FP --> FP2
    FP --> FP3
    
    FC --> FL
    FL --> FI
    
    FE --> FE1
    FE --> FE2
    FE --> FE3
    FE --> FE4
    
    FP -.Drag.-> FC
    FI -.Select.-> FE
    Actions -.Save.-> Redux[(Redux Store)]
```

---

## 5. Redux State Structure

```mermaid
graph TB
    Root[Root State]
    
    Root --> Auth[auth]
    Root --> Forms[forms]
    Root --> Submissions[submissions]
    Root --> Users[users]
    Root --> UI[ui]
    
    Auth --> A1[user]
    Auth --> A2[token]
    Auth --> A3[isAuthenticated]
    Auth --> A4[isLoading]
    Auth --> A5[error]
    
    Forms --> F1[items]
    Forms --> F2[currentForm]
    Forms --> F3[isLoading]
    Forms --> F4[error]
    Forms --> F5[pagination]
    
    Submissions --> S1[items]
    Submissions --> S2[currentSubmission]
    Submissions --> S3[isLoading]
    Submissions --> S4[error]
    
    Users --> U1[items]
    Users --> U2[currentUser]
    Users --> U3[isLoading]
    Users --> U4[error]
    
    UI --> UI1[sidebarOpen]
    UI --> UI2[theme]
    UI --> UI3[notifications]
```

---

## 6. Form Submission Flow

```mermaid
sequenceDiagram
    actor User
    participant Form as Public Form
    participant Validate as Validation
    participant Redux as Redux Store
    participant API as API Service
    participant Backend as FormDesignerAPI
    
    User->>Form: Fill form fields
    User->>Form: Click Submit
    Form->>Validate: Validate all fields
    
    alt Validation fails
        Validate-->>Form: Show errors
        Form-->>User: Display validation messages
    else Validation succeeds
        Validate-->>Form: Valid
        Form->>Redux: dispatch(submitForm)
        Redux->>API: POST /api/forms/{id}/submissions
        API->>Backend: Submit data
        Backend->>Backend: Process submission
        Backend->>Backend: Store in database
        Backend-->>API: Success response
        API-->>Redux: Update state
        Redux-->>Form: Submission successful
        Form->>Form: Show confirmation
        Form-->>User: Thank you message
        
        opt Redirect configured
            Form->>Form: Redirect to URL
        end
    end
```

---

## 7. Role-Based Access Control Flow

```mermaid
graph TB
    User[User Login]
    JWT[JWT Token Decode]
    Roles[Extract Roles]
    
    User --> JWT
    JWT --> Roles
    
    Roles --> Admin{Is Admin?}
    Roles --> Creator{Is Form Creator?}
    Roles --> Viewer{Is Form Viewer?}
    Roles --> BasicUser{Is Basic User?}
    
    Admin -->|Yes| AdminDash[Admin Dashboard]
    Admin -->|Yes| UserMgmt[User Management]
    Admin -->|Yes| AllForms[All Forms Access]
    Admin -->|Yes| AllSubmissions[All Submissions]
    
    Creator -->|Yes| FormCreate[Create Forms]
    Creator -->|Yes| FormEdit[Edit Forms]
    Creator -->|Yes| FormPublish[Publish Forms]
    Creator -->|Yes| ViewOwnSubs[View Own Submissions]
    
    Viewer -->|Yes| ViewForms[View Forms]
    Viewer -->|Yes| ViewSubs[View Submissions]
    
    BasicUser -->|Yes| PublicForm[Fill Public Forms]
    BasicUser -->|Yes| ViewProfile[View Own Profile]
```

---

## 8. Component Hierarchy

```mermaid
graph TB
    App[App.tsx]
    
    App --> Providers[Context Providers]
    App --> Router[Router]
    
    Providers --> AuthProvider[AuthProvider]
    Providers --> ThemeProvider[ThemeProvider]
    
    Router --> PublicRoutes[Public Routes]
    Router --> PrivateRoutes[Private Routes]
    
    PublicRoutes --> PLayout[PublicLayout]
    PrivateRoutes --> PRLayout[PrivateLayout]
    
    PLayout --> Login[Login Page]
    PLayout --> Register[Register Page]
    PLayout --> PublicForm[Public Form Page]
    
    PRLayout --> Navbar[Navbar]
    PRLayout --> Sidebar[Sidebar]
    PRLayout --> Content[Main Content]
    
    Content --> Dashboard[Dashboard]
    Content --> FormsList[Forms List]
    Content --> FormBuilder[Form Builder]
    Content --> FormEditor[Form Editor]
    Content --> SubmissionsList[Submissions List]
    Content --> UserMgmt[User Management]
    
    FormBuilder --> FieldPalette[Field Palette]
    FormBuilder --> FormCanvas[Form Canvas]
    FormBuilder --> FieldEditor[Field Editor]
```

---

## 9. Data Flow Architecture

```mermaid
graph LR
    subgraph "User Interface"
        Component[React Component]
    end
    
    subgraph "State Management"
        Action[Dispatch Action]
        Thunk[Async Thunk]
        Reducer[Reducer]
        Store[Redux Store]
    end
    
    subgraph "API Layer"
        Service[API Service]
        Interceptor[Interceptors]
        Axios[Axios Client]
    end
    
    subgraph "Backend"
        API[FormDesignerAPI]
    end
    
    Component -->|User Action| Action
    Action --> Thunk
    Thunk --> Service
    Service --> Interceptor
    Interceptor --> Axios
    Axios -->|HTTP Request| API
    API -->|HTTP Response| Axios
    Axios --> Interceptor
    Interceptor --> Service
    Service --> Thunk
    Thunk --> Reducer
    Reducer --> Store
    Store -->|State Update| Component
```

---

## 10. Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        Dev[Developer Machine]
        Git[Git Repository]
    end
    
    subgraph "CI/CD Pipeline"
        GHA[GitHub Actions]
        Build[Build Process]
        Test[Automated Tests]
        Deploy[Deploy Script]
    end
    
    subgraph "Production"
        CDN[CloudFront CDN]
        S3[AWS S3 Bucket]
        subgraph "Monitoring"
            Sentry[Sentry]
            Analytics[Analytics]
        end
    end
    
    subgraph "Backend"
        API[FormDesignerAPI]
        DB[(Database)]
    end
    
    Dev -->|Push Code| Git
    Git -->|Trigger| GHA
    GHA --> Build
    Build --> Test
    Test -->|Success| Deploy
    Deploy --> S3
    S3 --> CDN
    
    CDN -->|API Calls| API
    API --> DB
    
    CDN -->|Errors| Sentry
    CDN -->|Events| Analytics
```

---

## 11. Feature Module Structure

```mermaid
graph TB
    Feature[Feature Module]
    
    Feature --> Components[components/]
    Feature --> Pages[pages/]
    Feature --> Services[services/]
    Feature --> Slices[slices/]
    Feature --> Types[types/]
    Feature --> Utils[utils/]
    
    Components --> C1[Component1.tsx]
    Components --> C2[Component2.tsx]
    
    Pages --> P1[ListPage.tsx]
    Pages --> P2[DetailPage.tsx]
    
    Services --> S1[api.ts]
    Services --> S2[helpers.ts]
    
    Slices --> SL1[featureSlice.ts]
    
    Types --> T1[models.ts]
    Types --> T2[enums.ts]
    
    Utils --> U1[validators.ts]
    Utils --> U2[formatters.ts]
```

---

## 12. Error Handling Flow

```mermaid
sequenceDiagram
    participant Component
    participant Redux
    participant API
    participant ErrorHandler
    participant User
    
    Component->>Redux: Dispatch action
    Redux->>API: API call
    
    alt Success
        API-->>Redux: Success response
        Redux-->>Component: Update state
        Component-->>User: Show success
    else API Error
        API-->>ErrorHandler: Error response
        ErrorHandler->>ErrorHandler: Parse error
        ErrorHandler-->>Redux: Error message
        Redux-->>Component: Error state
        Component-->>User: Show error toast
    else Network Error
        API-->>ErrorHandler: Network error
        ErrorHandler-->>Redux: Network error message
        Redux-->>Component: Error state
        Component-->>User: Show network error
    else Validation Error
        API-->>ErrorHandler: 422 Response
        ErrorHandler->>ErrorHandler: Extract validation errors
        ErrorHandler-->>Redux: Validation errors
        Redux-->>Component: Error state
        Component-->>User: Show field errors
    end
```

---

## 13. Form Builder State Machine

```mermaid
stateDiagram-v2
    [*] --> Idle: Load Builder
    
    Idle --> AddingField: Drag Field
    Idle --> SelectingField: Click Field
    Idle --> EditingForm: Edit Form Settings
    
    AddingField --> Idle: Drop Field
    AddingField --> Idle: Cancel
    
    SelectingField --> EditingField: Open Editor
    EditingField --> SelectingField: Apply Changes
    EditingField --> Idle: Close Editor
    
    EditingForm --> Idle: Save Settings
    
    Idle --> Saving: Click Save
    Saving --> Idle: Save Complete
    Saving --> Error: Save Failed
    Error --> Idle: Dismiss Error
    
    Idle --> Previewing: Click Preview
    Previewing --> Idle: Close Preview
    
    Idle --> Publishing: Click Publish
    Publishing --> Published: Publish Success
    Published --> [*]
```

---

## 14. Testing Strategy Pyramid

```mermaid
graph TB
    subgraph "Testing Pyramid"
        E2E[E2E Tests - 10%<br/>Critical User Journeys]
        Integration[Integration Tests - 20%<br/>Feature Flows & API Integration]
        Unit[Unit Tests - 70%<br/>Components, Hooks, Utils, Redux]
    end
    
    E2E --> E2E1[Login Flow]
    E2E --> E2E2[Form Creation Flow]
    E2E --> E2E3[Form Submission Flow]
    
    Integration --> I1[Auth Flow Tests]
    Integration --> I2[Form Builder Tests]
    Integration --> I3[API Integration Tests]
    
    Unit --> U1[Component Tests]
    Unit --> U2[Redux Slice Tests]
    Unit --> U3[Hook Tests]
    Unit --> U4[Utility Tests]
    
    style E2E fill:#ff6b6b
    style Integration fill:#ffd93d
    style Unit fill:#6bcf7f
```

---

## 15. Performance Optimization Strategy

```mermaid
graph LR
    subgraph "Bundle Optimization"
        CodeSplit[Code Splitting]
        LazyLoad[Lazy Loading]
        TreeShake[Tree Shaking]
    end
    
    subgraph "Runtime Optimization"
        Memo[React.memo]
        UseMemo[useMemo]
        UseCallback[useCallback]
        Virtualize[Virtualization]
    end
    
    subgraph "Caching"
        ReduxPersist[Redux Persist]
        APICache[API Caching]
        ServiceWorker[Service Worker]
    end
    
    subgraph "Asset Optimization"
        ImageOpt[Image Optimization]
        FontOpt[Font Optimization]
        MinifyCSS[Minify CSS/JS]
    end
    
    App[Application]
    
    App --> CodeSplit
    App --> LazyLoad
    App --> TreeShake
    App --> Memo
    App --> UseMemo
    App --> UseCallback
    App --> Virtualize
    App --> ReduxPersist
    App --> APICache
    App --> ServiceWorker
    App --> ImageOpt
    App --> FontOpt
    App --> MinifyCSS
```

---

## 16. CI/CD Pipeline

```mermaid
graph LR
    subgraph "Development"
        Commit[Git Commit]
        Push[Git Push]
    end
    
    subgraph "Continuous Integration"
        Trigger[GitHub Actions]
        Install[Install Dependencies]
        Lint[Lint Code]
        Test[Run Tests]
        Build[Build Application]
    end
    
    subgraph "Quality Gates"
        Coverage[Check Coverage]
        Security[Security Scan]
        Performance[Performance Check]
    end
    
    subgraph "Continuous Deployment"
        Deploy[Deploy to Staging]
        Smoke[Smoke Tests]
        Prod[Deploy to Production]
    end
    
    Commit --> Push
    Push --> Trigger
    Trigger --> Install
    Install --> Lint
    Lint --> Test
    Test --> Build
    Build --> Coverage
    Coverage --> Security
    Security --> Performance
    Performance -->|Pass| Deploy
    Performance -->|Fail| Notify[Notify Team]
    Deploy --> Smoke
    Smoke -->|Pass| Prod
    Smoke -->|Fail| Rollback[Rollback]
```

---

## 17. Security Architecture

```mermaid
graph TB
    subgraph "Client Security"
        XSS[XSS Protection<br/>React Escaping]
        CSRF[CSRF Token]
        Input[Input Validation]
        HTTPS[HTTPS Only]
    end
    
    subgraph "Authentication"
        JWT[JWT Token]
        Refresh[Refresh Token]
        Expire[Token Expiration]
    end
    
    subgraph "Authorization"
        RBAC[Role-Based Access Control]
        Permissions[Permission Checks]
        Guards[Route Guards]
    end
    
    subgraph "Data Protection"
        Encrypt[Data Encryption]
        Sanitize[Input Sanitization]
        NoStore[No Sensitive Data in localStorage]
    end
    
    subgraph "API Security"
        CORS[CORS Policy]
        RateLimit[Rate Limiting]
        Headers[Security Headers]
    end
    
    App[React Application]
    
    App --> XSS
    App --> CSRF
    App --> Input
    App --> HTTPS
    App --> JWT
    App --> Refresh
    App --> Expire
    App --> RBAC
    App --> Permissions
    App --> Guards
    App --> Encrypt
    App --> Sanitize
    App --> NoStore
    
    API[FormDesignerAPI]
    
    App -.->|Secure Communication| API
    API --> CORS
    API --> RateLimit
    API --> Headers
```

---

These diagrams provide comprehensive visual representation of the Form Designer React Application architecture, flows, and design patterns. They can be rendered using any Mermaid-compatible tool or viewer.
