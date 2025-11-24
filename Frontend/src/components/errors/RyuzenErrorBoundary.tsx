import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class RyuzenErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Ryuzen UI crashed", error, info);
    // TODO: send error to backend observability pipeline.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--surface-base)] p-8 text-[var(--text-primary)]">
          <div className="w-full max-w-md space-y-3 rounded-3xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] p-6 text-center shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-secondary)]">Ryuzen Recovery</p>
            <h1 className="text-2xl font-semibold">Something went off-script</h1>
            <p className="text-sm text-[var(--text-secondary)]">
              The interface hit an unexpected state. Telemetry has been logged. Refresh to rehydrate your workspace safely.
            </p>
            <button
              className="rounded-xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--accent-secondary)_35%,transparent)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)]"
              onClick={() => window.location.reload()}
            >
              Reload Ryuzen
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
