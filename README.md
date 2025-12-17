# Form Designer Application

AI-Powered Form Designer with PDF Intelligence and Code Generation

## 🚀 Features

### Phase 1 (Current): Core Infrastructure
- ✅ **Project Setup**: Vite + React 18 + TypeScript
- ✅ **State Management**: Redux Toolkit
- ✅ **Routing**: React Router v6 (coming next)
- ✅ **UI Framework**: React Bootstrap
- ✅ **API Integration**: Axios with interceptors
- ✅ **Code Quality**: ESLint + Prettier

### Phase 2: PDF Intelligence
- 📄 **PDF Upload**: Drag-and-drop PDF form upload
- 🤖 **AI Analysis**: Azure Document Intelligence integration
- 🔍 **Structure Review**: Interactive field extraction and editing
- 📝 **Form Definition**: Convert extracted data to form specification

### Phase 3: Code Generation
- ⚙️ **Template Engine**: Multiple framework templates
- 🎨 **Customization**: Configure styling, validation, backend options
- 📦 **Code Output**: Complete React components + backend code
- ⬇️ **Download**: ZIP package with all generated files

## 📋 Prerequisites

- Node.js 18+ and npm
- Git

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd form-designer-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.development
```

Edit `.env.development` with your configuration:
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Form Designer
```

4. **Start development server**
```bash
npm run dev
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
form-designer-app/
├── src/
│   ├── app/                    # Redux store configuration
│   │   ├── store.ts
│   │   └── hooks.ts
│   ├── features/               # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── projects/          # Project management
│   │   ├── pdf-upload/        # PDF upload & processing
│   │   ├── document-intelligence/  # AI analysis
│   │   ├── code-generation/   # Code generation
│   │   └── users/             # User management
│   ├── shared/                # Shared resources
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom hooks
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript types
│   │   └── constants/         # Constants
│   ├── services/              # API services
│   │   ├── api/               # API client & endpoints
│   │   └── storage/           # Local storage utilities
│   ├── routes/                # Route configuration
│   ├── styles/                # Global styles
│   ├── App.tsx
│   └── main.tsx
├── public/
├── .env.development
├── .env.production
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 🔧 Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

## 🎨 Tech Stack

### Core
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool

### State Management
- **Redux Toolkit** - State management
- **React Redux** - React bindings

### Routing & UI
- **React Router v6** - Client-side routing
- **React Bootstrap** - UI components
- **Bootstrap 5** - CSS framework
- **Sass** - CSS preprocessor

### Forms & Validation
- **Formik** - Form handling
- **Yup** - Schema validation

### API & Data
- **Axios** - HTTP client
- **React Syntax Highlighter** - Code display
- **PDF.js** - PDF rendering
- **@dnd-kit** - Drag and drop

## 🔐 Environment Variables

Create `.env.development` or `.env.production`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# Application
VITE_APP_NAME=Form Designer

# Authentication
VITE_TOKEN_REFRESH_INTERVAL=840000

# File Upload (in bytes)
VITE_MAX_FILE_SIZE=10485760

# Features
VITE_ENABLE_ANALYTICS=false

# Development
VITE_ENABLE_DEBUG=true
```

## 📚 Documentation

Comprehensive documentation is available in the docs folder:

- Solution Architecture
- PDF Intelligence Specifications
- Technical Specifications
- Implementation Plan
- API Integration Guide
- Quick Reference Guide

## 🏗️ Development Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Production hotfixes

### Commit Convention
```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

### Code Style
- Use TypeScript strict mode
- Follow ESLint rules
- Format with Prettier
- Write tests for new features

## 🧪 Testing (Coming in Phase 6)

```bash
npm run test              # Run unit tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage
npm run test:e2e          # Run E2E tests
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

The build artifacts will be in the `dist/` directory.

### Deploy to Hosting
- **Netlify**: Connect repository and deploy
- **Vercel**: Connect repository and deploy
- **AWS S3 + CloudFront**: Upload dist folder

## 📈 Project Timeline

- **Week 1**: ✅ Project Setup (Current)
- **Weeks 2-3**: Foundation & Core Infrastructure
- **Weeks 4-5**: Authentication & Authorization
- **Weeks 6-9**: PDF Intelligence & Code Generation
- **Weeks 10-11**: Enhanced Features
- **Weeks 12-14**: Manual Form Builder
- **Weeks 15-16**: Testing & Deployment

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and formatting
4. Commit with conventional commits
5. Push and create a pull request

## 📝 License

This project is proprietary and confidential.

## 📞 Support

For questions or issues, contact the development team.

---

**Built with ❤️ using React, TypeScript, and AI**
