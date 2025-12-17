import { Component, ErrorInfo, ReactNode } from 'react';
import { Container, Alert, Button } from 'react-bootstrap';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container className="py-5">
          <Alert variant="danger">
            <Alert.Heading>⚠️ Something went wrong</Alert.Heading>
            <p>We're sorry, but something unexpected happened. Please try again.</p>
            {this.state.error && (
              <details className="mt-3">
                <summary className="cursor-pointer">Error Details</summary>
                <pre className="mt-2 p-3 bg-light rounded small">
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
            <hr />
            <div className="d-flex gap-2">
              <Button variant="outline-danger" onClick={this.handleReset}>
                Try Again
              </Button>
              <Button variant="outline-danger" onClick={() => window.location.href = '/'}>
                Go Home
              </Button>
            </div>
          </Alert>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
