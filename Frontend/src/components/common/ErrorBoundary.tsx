import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[Ryuzen] Render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="glass-panel mx-auto mt-12 max-w-2xl rounded-2xl border border-[var(--border-strong)] bg-[var(--panel-elevated)] p-8 text-center shadow-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
              Something went wrong
            </h2>
            <p className="mt-3 text-[var(--text-secondary)]">
              Our monitors have been alerted. Try refreshing or heading back home.
            </p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
