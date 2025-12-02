import React from "react";
import { AlertTriangle, CheckCircle2, PlugZap, RefreshCcw } from "lucide-react";
import { WorkspaceConnector } from "@/types/workspace";

interface ConnectorsPanelProps {
  connectors: WorkspaceConnector[];
  onChange: (next: WorkspaceConnector[]) => void;
}

const statusStyles: Record<WorkspaceConnector["status"], string> = {
  connected: "bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:text-emerald-100",
  warning: "bg-yellow-400/20 text-yellow-800 border-yellow-500/40 dark:text-yellow-100",
  error: "bg-red-500/20 text-red-800 border-red-500/40 dark:text-red-100",
};

const ConnectorsPanel: React.FC<ConnectorsPanelProps> = ({ connectors, onChange }) => {
  const reconnect = (id: string) => {
    const updated = connectors.map((connector) =>
      connector.id === id
        ? { ...connector, status: "connected", lastSync: "Just now" }
        : connector,
    );
    onChange(updated);
  };

  return (
    <div className="rounded-[32px] border border-black/10 bg-black/5 p-6 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-black/70 dark:text-white/70">
        <div className="flex items-center gap-2">
          <PlugZap className="h-4 w-4" /> Connectors Panel
        </div>
        <span className="rounded-full bg-black/10 px-3 py-1 text-xs text-black/70 dark:bg-white/10 dark:text-white/70">{connectors.length} integrations</span>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {connectors.map((connector) => (
          <div
            key={connector.id}
            className="rounded-2xl border border-black/10 bg-black/5 p-4 dark:border-white/10 dark:bg-white/5"
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
            <p className="mt-1 text-xs text-black/60 dark:text-white/60">Last sync {connector.lastSync}</p>
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] ${statusStyles[connector.status]}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              {connector.status}
            </div>
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

export default ConnectorsPanel;
