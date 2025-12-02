import React from "react";
import { AlertTriangle, CheckCircle2, PlugZap, RefreshCcw } from "lucide-react";
import { WorkspaceConnector } from "@/types/workspace";

interface ConnectorsWidgetProps {
  connectors: WorkspaceConnector[];
  onChange: (next: WorkspaceConnector[]) => void;
  onExpand: () => void;
}

const statusStyles: Record<WorkspaceConnector["status"], string> = {
  connected: "bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:text-emerald-100",
  warning: "bg-yellow-400/20 text-yellow-800 border-yellow-500/40 dark:text-yellow-100",
  error: "bg-red-500/20 text-red-800 border-red-500/40 dark:text-red-100",
};

const ConnectorsWidget: React.FC<ConnectorsWidgetProps> = ({ connectors, onChange, onExpand }) => {
  const reconnect = (id: string) => {
    const updated = connectors.map((connector) =>
      connector.id === id
        ? { ...connector, status: "connected", lastSync: "Just now" }
        : connector,
    );
    onChange(updated);
    window.dispatchEvent(new CustomEvent("toron-signal", { detail: { connectors: updated } }));
  };

  return (
    <div
      className="relative overflow-hidden rounded-[32px] border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-4 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl transition hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      onClick={onExpand}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-black/10 dark:ring-white/10" />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">
          <PlugZap className="h-4 w-4" /> Connectors
        </div>
        <span className="rounded-full bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-3 py-1 text-xs text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:bg-[var(--glass)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">{connectors.length} linked</span>
      </div>
      <div
        className="flex gap-3 overflow-x-auto pb-3 pr-2"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {connectors.map((connector) => (
          <div
            key={connector.id}
            className="min-w-[140px] rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-3 shadow-inner backdrop-blur-xl dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]"
          >
            <div className="flex items-center justify-between text-sm font-semibold text-black dark:text-white">
              {connector.name}
              {connector.status === "connected" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : connector.status === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] ${statusStyles[connector.status]}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              {connector.status}
            </div>
            <p className="mt-2 text-xs text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">Last sync {connector.lastSync}</p>
            {connector.status !== "connected" && (
              <button
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-3 py-2 text-xs text-[var(--text)] transition hover:bg-black/15 dark:bg-[var(--glass)] dark:text-[var(--text)] dark:hover:bg-[color-mix(in_oklab,var(--glass)_85%,transparent)]"
                onClick={() => reconnect(connector.id)}
              >
                <RefreshCcw className="h-4 w-4" /> Reconnect
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectorsWidget;
