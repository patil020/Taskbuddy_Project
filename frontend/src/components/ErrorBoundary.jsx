// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="container mt-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card border-danger">
                <div className="card-header bg-danger text-white">
                  <h4 className="mb-0">
                    <i className="bi bi-exclamation-triangle"></i> Something went wrong
                  </h4>
                </div>
                <div className="card-body">
                  <p className="card-text">
                    We're sorry, but something unexpected happened. Please try refreshing the page.
                  </p>
                  <button 
                    className="btn btn-primary me-2"
                    onClick={() => window.location.reload()}
                  >
                    <i className="bi bi-arrow-clockwise"></i> Refresh Page
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  >
                    <i className="bi bi-arrow-left"></i> Try Again
                  </button>
                  
                  {/* Show error details in development */}
                  {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="mt-3">
                      <details className="text-muted">
                        <summary style={{ cursor: 'pointer' }}>Error Details (Development)</summary>
                        <pre className="mt-2 p-2 bg-light rounded small">
                          {this.state.error && this.state.error.toString()}
                          <br />
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
