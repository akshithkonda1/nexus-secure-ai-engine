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
          <p className="text-sm opacity-80">{this.state.error.message || "Something went wrong."}</p>
          <Link
            className="inline-flex items-center justify-center rounded-zora-lg px-4 py-2.5 bg-zora-aurora text-zora-night font-semibold shadow-zora-glow transition-transform transition-shadow hover:translate-y-[-1px] hover:shadow-zora-glow hover:scale-[1.01] active:translate-y-[0px] active:scale-[0.99]"
            to="/"
          >
            Back to Overview
          </Link>
        </div>
      </main>
    );
  }
}
