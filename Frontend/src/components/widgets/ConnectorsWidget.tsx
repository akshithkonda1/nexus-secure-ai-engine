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
      className="relative overflow-hidden rounded-[32px] border border-black/10 bg-black/5 p-4 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl transition hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      onClick={onExpand}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-black/10 dark:ring-white/10" />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-black/60 dark:text-white/60">
          <PlugZap className="h-4 w-4" /> Connectors
        </div>
        <span className="rounded-full bg-black/10 px-3 py-1 text-xs text-black/70 dark:bg-white/10 dark:text-white/70">{connectors.length} linked</span>
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
            className="min-w-[140px] rounded-2xl border border-black/10 bg-black/5 p-3 shadow-inner backdrop-blur-xl dark:border-white/10 dark:bg-white/5"
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
            <p className="mt-2 text-xs text-black/60 dark:text-white/60">Last sync {connector.lastSync}</p>
            {connector.status !== "connected" && (
              <button
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-black/10 px-3 py-2 text-xs text-black/80 transition hover:bg-black/15 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
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
