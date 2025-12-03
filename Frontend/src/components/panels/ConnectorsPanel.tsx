import React from "react";
import { AlertTriangle, CheckCircle2, PlugZap, RefreshCcw } from "lucide-react";
import { WorkspaceConnector } from "@/types/workspace";

interface ConnectorsPanelProps {
  connectors: WorkspaceConnector[];
  onChange: (next: WorkspaceConnector[]) => void;
  close?: () => void;
}

const glassPanelClass =
  "relative bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-3xl px-6 py-5 transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-glassInner before:blur-xl before:pointer-events-none hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong hover:scale-[1.01]";

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
    <div className={`flex h-full flex-col gap-4 ${glassPanelClass}`}>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm uppercase tracking-[0.2em]">
        <h2 className="flex items-center gap-2 font-semibold text-textPrimary">
          <PlugZap className="h-4 w-4" /> Connectors Control
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-glassBorder px-3 py-1 text-xs font-semibold text-textSecondary">
            {connectors.length} integrations
          </span>
          {close && (
            <button
              onClick={close}
              className="rounded-full border border-glassBorder px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-glassBorderStrong"
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {connectors.map((connector) => (
          <div key={connector.id} className={`${glassPanelClass} p-4 shadow-none`}>
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
            <p className="mt-1 text-sm text-textMuted">Last sync {connector.lastSync}</p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-glassBorder bg-glass px-3 py-1 text-xs font-semibold text-textPrimary">
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
            {connector.status !== "connected" && (
              <button
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-glassBorder bg-glass px-3 py-2 text-xs font-semibold text-textPrimary transition hover:border-glassBorderStrong"
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
