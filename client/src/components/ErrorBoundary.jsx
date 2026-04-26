import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', padding: '2rem' }}>
          <h1 className="title-main" style={{color: '#ef4444'}}>Something went wrong</h1>
          <p className="text-muted" style={{maxWidth: '600px', marginBottom: '2rem'}}>
            We've encountered an unexpected issue while rendering this page. Our reliable fallback system has safely caught the crash. Please try refreshing or clearing caches.
          </p>
          <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
            Return to Homepage
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
