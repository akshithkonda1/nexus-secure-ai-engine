import React from "react";
import { AlertTriangle, CheckCircle2, PlugZap, RefreshCcw } from "lucide-react";
import { WorkspaceConnector } from "@/types/workspace";

interface ConnectorsPanelProps {
  connectors: WorkspaceConnector[];
  onChange: (next: WorkspaceConnector[]) => void;
  close?: () => void;
}

const statusStyles: Record<WorkspaceConnector["status"], string> = {
  connected: "bg-emerald-500/15 text-emerald-800 border-emerald-500/30 dark:text-emerald-100",
  warning: "bg-yellow-400/20 text-yellow-800 border-yellow-500/40 dark:text-yellow-100",
  error: "bg-red-500/20 text-red-800 border-red-500/40 dark:text-red-100",
};

const ConnectorsPanel: React.FC<ConnectorsPanelProps> = ({ connectors, onChange, close }) => {
  const reconnect = (id: string) => {
    const updated = connectors.map((connector) =>
      connector.id === id
        ? { ...connector, status: "connected", lastSync: "Just now" }
        : connector,
    );
    onChange(updated);
  };

  return (
    <div className="rounded-[32px] border border-[var(--border)] bg-[var(--glass)] p-6 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
        <div className="flex items-center gap-2">
          <PlugZap className="h-4 w-4" /> Connectors Panel
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-1 text-xs text-[color-mix(in_oklab,var(--text)_70%,transparent)]">{connectors.length} integrations</span>
          {close && (
            <button
              onClick={close}
              className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-1 text-[11px] uppercase tracking-wide text-[color-mix(in_oklab,var(--text)_70%,transparent)]"
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {connectors.map((connector) => (
          <div
            key={connector.id}
            className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] p-4"
          >
            <div className="flex items-center justify-between text-sm font-semibold text-[var(--text)]">
              {connector.name}
              {connector.status === "connected" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : connector.status === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="mt-1 text-xs text-[color-mix(in_oklab,var(--text)_65%,transparent)]">Last sync {connector.lastSync}</p>
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] ${statusStyles[connector.status]}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              {connector.status}
            </div>
            {connector.status !== "connected" && (
              <button
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-3 py-2 text-xs text-[var(--text)] transition hover:bg-[color-mix(in_oklab,var(--glass)_85%,transparent)]"
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
