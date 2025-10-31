import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught an error", error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app px-6 text-center text-primary">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold">Something went sideways.</h1>
            <p className="text-sm text-muted">
              We logged the issue. Try refreshing, or head back to the home view.
            </p>
          </div>
          <a className="round-btn border border-subtle px-4 py-2" href="/">
            Try again
          </a>
        </div>
      );
    }

    return this.props.children;
  }
}
