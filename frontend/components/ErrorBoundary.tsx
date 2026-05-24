import React, { Component, ErrorInfo, ReactNode } from 'react';
import ErrorPage from './ErrorPage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  retryKey: number;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    retryKey: 0,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    // TODO: Add error reporting to a service like Sentry or LogRocket
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorPage
          onRetry={() => this.setState((prev) => ({ hasError: false, retryKey: prev.retryKey + 1 }))}
          onGoHome={() => window.location.assign('/')}
        />
      );
    }

    return <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>;
  }
}

export default ErrorBoundary;
