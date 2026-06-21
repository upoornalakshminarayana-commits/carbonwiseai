import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertIcon } from './Icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="glass-card fade-in" style={{ maxWidth: '580px', margin: '80px auto', textAlign: 'center', padding: '52px 40px', border: '1px solid rgba(248,113,113,0.3)', boxShadow: '0 8px 32px rgba(248, 113, 113, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--color-critical)', marginBottom: '20px' }}>
            <AlertIcon size={48} />
          </div>
          <h2 style={{ fontSize: '1.6rem', marginBottom: '12px', color: 'var(--color-critical)' }}>Something went wrong</h2>
          <p style={{ marginBottom: '24px', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
            An unexpected error occurred while rendering this component. This could be due to a deployment configuration issue or a temporary service disruption.
          </p>
          {this.state.error && (
            <pre style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.8rem', color: 'var(--color-critical)', border: '1px solid rgba(248,113,113,0.1)', marginBottom: '32px', fontFamily: 'monospace' }}>
              {this.state.error.toString()}
            </pre>
          )}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={this.handleReset} style={{ padding: '12px 24px', fontSize: '0.9rem' }}>
              Reload Page
            </button>
            <a href="/" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              Go to Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
