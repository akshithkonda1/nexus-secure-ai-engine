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
        <div className="panel p-8 max-w-xl text-center space-y-4">
          <h1 className="text-2xl font-semibold">We hit a snag</h1>
          <p className="text-sm opacity-80">{this.state.error.message || "Something went wrong."}</p>
          <Link className="btn btn-primary" to="/">Back to Overview</Link>
        </div>
      </main>
    );
  }
}
