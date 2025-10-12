import { Component, ReactNode } from "react";
type Props = { children: ReactNode };
type State = { hasError: boolean; message?: string };
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(err: Error) { return { hasError: true, message: err.message }; }
  componentDidCatch(err: Error) { console.error("UI Error:", err); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-sm">
          <b>Something went wrong.</b>
          <div className="mt-2 opacity-70">{this.state.message}</div>
          <button className="mt-3 px-3 py-1 rounded bg-neutral-200"
                  onClick={()=>location.reload()}>Reload</button>
        </div>
      );
    }
    return this.props.children;
  }
}
