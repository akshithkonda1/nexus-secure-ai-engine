import { ReactNode } from "react";

export type Renderable = () => ReactNode;

type TelemetryFn = (event: string, payload?: Record<string, unknown>) => void;

// Wraps fragile render trees and prevents global boundary crashes.
export const safeRender = (
  componentFn: Renderable,
  fallback?: ReactNode,
  telemetry?: TelemetryFn,
): ReactNode => {
  try {
    return componentFn();
  } catch (error) {
    try {
      telemetry?.("render_error", { message: (error as Error)?.message ?? "unknown render error" });
    } catch {
      // ignore telemetry failures
    }
    return fallback ?? (
      <div className="rounded-md border border-[var(--border-strong)] bg-[var(--panel-strong)] p-4 text-sm text-[var(--text-secondary)]">
        Something went wrong, but the Toron workspace is still running.
      </div>
    );
  }
};

export default safeRender;
