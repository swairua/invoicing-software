import React from 'react';
import { Button } from './ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error details
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // Check if it's the specific filter error we're trying to fix
    if (error.message.includes('filter is not a function')) {
      console.error('Filter error detected:', {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const isFilterError = this.state.error?.message.includes('filter is not a function');
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card border rounded-lg p-6 text-center space-y-4">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-xl font-semibold">Something went wrong</h1>
              <p className="text-muted-foreground">
                {isFilterError 
                  ? "We detected a data loading issue. This usually resolves with a page refresh."
                  : "An unexpected error occurred. Please try refreshing the page."
                }
              </p>
            </div>

            <div className="space-y-2">
              <Button onClick={this.handleReload} className="w-full">
                Refresh Page
              </Button>
              <Button onClick={this.handleReset} variant="outline" className="w-full">
                Try Again
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {this.state.error.message}
                  {'\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
