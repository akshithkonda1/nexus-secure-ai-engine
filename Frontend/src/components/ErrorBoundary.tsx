import { Component, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(err: unknown): State {
    return { hasError: true, message: err instanceof Error ? err.message : String(err) };
  }
  componentDidCatch(err: unknown) {
    // eslint-disable-next-line no-console
    console.error("[Nexus] Render error:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-sm">
          <div className="glass max-w-2xl mx-auto p-6">
            <h1 className="text-lg font-semibold mb-2">Something went wrong.</h1>
            <p className="text-subtle break-all">{this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
