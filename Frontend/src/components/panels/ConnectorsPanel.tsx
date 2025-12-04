import React from "react";
import { AlertTriangle, CheckCircle2, PlugZap, RefreshCcw } from "lucide-react";
import { WorkspaceConnector } from "@/types/workspace";

interface ConnectorsPanelProps {
  connectors: WorkspaceConnector[];
  onChange: (next: WorkspaceConnector[]) => void;
  close?: () => void;
}

const surfaceClass =
  "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";

const innerCard = `${surfaceClass} px-4 py-4`;

const ConnectorsPanel: React.FC<ConnectorsPanelProps> = ({ connectors, onChange, close }) => {
  const reconnect = (id: string) => {
    const updated = connectors.map((connector) =>
      connector.id === id
        ? { ...connector, status: "connected", lastSync: "Just now" }
        : connector
    );
    onChange(updated);
  };

  return (
    <div className={`${surfaceClass} flex h-full flex-col gap-4`}>

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm uppercase tracking-[0.2em]">
        <h2 className="flex items-center gap-2 font-semibold text-textPrimary">
          <PlugZap className="h-4 w-4" /> Connectors Control
        </h2>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-neutral-300/50 bg-white/85 px-3 py-1 text-xs font-semibold text-textSecondary backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85">
            {connectors.length} integrations
          </span>

          {close && (
            <button
              onClick={close}
              className="rounded-full border border-neutral-300/50 bg-white/85 px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-neutral-400 backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85 dark:hover:border-neutral-600"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* CONNECTOR GRID */}
      <div className="grid gap-3 md:grid-cols-2">
        {connectors.map((connector) => (
          <div key={connector.id} className={innerCard}>

            {/* Row 1 — Name + Status Icon */}
            <div className="flex items-center justify-between text-sm">
              <p className="font-semibold text-textPrimary">{connector.name}</p>

              {connector.status === "connected" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : connector.status === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>

            {/* Row 2 — Last Sync */}
            <p className="mt-1 text-sm text-textMuted">
              Last sync {connector.lastSync}
            </p>

            {/* Row 3 — Status Badge */}
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-neutral-300/50 bg-white/85 px-3 py-1 text-xs font-semibold text-textPrimary backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85">
              <span
                className={`h-2 w-2 rounded-full ${
                  connector.status === "connected"
                    ? "bg-emerald-500"
                    : connector.status === "warning"
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              />
              <span className="capitalize">{connector.status}</span>
            </div>

            {/* Row 4 — Reconnect Button */}
            {connector.status !== "connected" && (
              <button
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-300/50 bg-white/85 px-3 py-2 text-xs font-semibold text-textPrimary transition hover:border-neutral-400 backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85 dark:hover:border-neutral-600"
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
