/**
 * Enhanced Error Boundary Component
 * Catches errors in workspace components and provides graceful fallback
 * with data recovery options
 */

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Download, Trash2 } from 'lucide-react';
import { useWorkspaceStore } from '../../stores/workspaceStore';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
  resetCount: number;
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      resetCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });

    // Log to error tracking service (Sentry, LogRocket, etc.)
    // trackError(error, errorInfo);
  }

  handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }

    this.setState(state => ({
      hasError: false,
      error: null,
      errorInfo: null,
      resetCount: state.resetCount + 1,
    }));
  };

  handleExportData = () => {
    try {
      const data = useWorkspaceStore.getState().exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ryuzen-backup-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export data:', err);
      alert('Export failed. Please try again or contact support.');
    }
  };

  handleClearData = () => {
    if (window.confirm('This will clear ALL workspace data and reload the page. This cannot be undone. Are you sure?')) {
      try {
        // Clear all workspace-related storage
        localStorage.removeItem('ryuzen-workspace-v1');
        localStorage.removeItem('ryuzen-workspace-storage');
        localStorage.removeItem('window-manager-storage');

        // Reload the page
        window.location.reload();
      } catch (err) {
        console.error('Failed to clear data:', err);
        alert('Clear failed. Please try manually clearing browser data.');
      }
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Show different message if repeated crashes
      const isRepeatedCrash = this.state.resetCount >= 2;

      return (
        <div className="flex h-full min-h-[400px] w-full items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/5 p-8">
          <div className="max-w-md space-y-4 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-[var(--text)]">
                {isRepeatedCrash ? 'Persistent Error Detected' : 'Something went wrong'}
              </h2>
              <p className="mt-2 text-sm text-[var(--text-muted)]">
                {isRepeatedCrash
                  ? 'The component keeps crashing. Your data is safe, but you may need to clear corrupted state.'
                  : 'An error occurred in this component. Your data is safe.'}
              </p>
            </div>

            {this.state.error && (
              <details className="mt-4 rounded-lg bg-[var(--bg-elev)] p-4 text-left">
                <summary className="cursor-pointer text-sm font-semibold text-[var(--text)]">
                  Error details
                </summary>
                <pre className="mt-2 max-h-48 overflow-auto text-xs text-red-600 dark:text-red-400">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </button>

              {isRepeatedCrash && (
                <>
                  <button
                    onClick={this.handleExportData}
                    className="flex items-center justify-center gap-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--bg-elev)]"
                  >
                    <Download className="h-4 w-4" />
                    Export Data (Backup)
                  </button>

                  <button
                    onClick={this.handleClearData}
                    className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-500/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Data & Reload
                  </button>
                </>
              )}
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              {isRepeatedCrash
                ? 'Export your data first before clearing. If this problem persists, please contact support.'
                : 'If this problem persists, please contact support with the error details above.'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
