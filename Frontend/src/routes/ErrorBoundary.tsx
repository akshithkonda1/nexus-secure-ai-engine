import React from "react";
import { Link } from "react-router-dom";

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren,
  { error?: Error }
> {
  state = { error: undefined as Error | undefined };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch() { /* could log here */ }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="min-h-screen grid place-items-center p-8">
        <div className="panel panel--glassy panel--hover p-8 max-w-xl text-center space-y-4">
          <h1 className="text-2xl font-semibold">We hit a snag</h1>
          <p className="mt-1 text-xs text-slate-300">
            Ryuzen ran into an issue while loading this view. Try going back to Overview or
            refreshing the page.
          </p>
          <Link
            className="inline-flex items-center justify-center rounded-[var(--radius-button)] px-4 py-2.5 bg-[rgb(var(--brand))] text-[rgb(var(--on-accent))] font-semibold shadow-[0_0_34px_rgba(0,133,255,0.28)] transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-[0_0_40px_rgba(0,133,255,0.35)] hover:scale-[1.01] active:translate-y-[0px] active:scale-[0.99]"
            to="/"
          >
            Back to Overview
          </Link>
        </div>
      </main>
    );
  }
}
