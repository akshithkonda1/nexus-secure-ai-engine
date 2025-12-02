import React from "react";
import { AlertTriangle, CheckCircle2, PlugZap, RefreshCcw } from "lucide-react";
import { WorkspaceConnector } from "@/types/workspace";

interface ConnectorsPanelProps {
  connectors: WorkspaceConnector[];
  onChange: (next: WorkspaceConnector[]) => void;
  close?: () => void;
}

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
      <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.2em]">
        <h2 className="flex items-center gap-2 text-neutral-900 dark:text-neutral-50">
          <PlugZap className="h-4 w-4" /> CONNECTORS PANEL
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-1 text-xs tracking-widest text-neutral-500 dark:text-neutral-400">
            {connectors.length} integrations
          </span>
          {close && (
            <button
              onClick={close}
              className="rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-4 py-1 text-[11px] uppercase tracking-wide text-neutral-700 transition hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-white/10"
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
            <div className="flex items-center justify-between text-sm">
              <p className="font-semibold text-neutral-900 dark:text-neutral-100">{connector.name}</p>
              {connector.status === "connected" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : connector.status === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">Last sync {connector.lastSync}</p>
            <div className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-mint-100 text-mint-700 dark:bg-mint-900/40 dark:text-mint-300">
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              {connector.status}
            </div>
            {connector.status !== "connected" && (
              <button
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-3 py-2 text-xs text-neutral-700 transition hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-white/10"
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
