import React from "react";
import { AlertTriangle, CheckCircle2, PlugZap, RefreshCcw } from "lucide-react";
import { WorkspaceConnector } from "@/types/workspace";
import { useTheme } from "@/theme/ThemeProvider";

interface ConnectorsPanelProps {
  connectors: WorkspaceConnector[];
  onChange: (next: WorkspaceConnector[]) => void;
  close?: () => void;
}

const ConnectorsPanel: React.FC<ConnectorsPanelProps> = ({ connectors, onChange, close }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const reconnect = (id: string) => {
    const updated = connectors.map((connector) =>
      connector.id === id
        ? { ...connector, status: "connected", lastSync: "Just now" }
        : connector,
    );
    onChange(updated);
  };

  const border = isDark ? "border-white/10" : "border-black/5";
  const surface = isDark ? "bg-neutral-900" : "bg-white";
  const textPrimary = isDark ? "text-neutral-100" : "text-neutral-900";
  const textSecondary = isDark ? "text-neutral-300" : "text-neutral-700";

  return (
    <div className={`flex h-full flex-col gap-4 rounded-3xl border ${border} ${surface} p-6 shadow-xl`}>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm uppercase tracking-[0.2em]">
        <h2 className={`flex items-center gap-2 font-semibold ${textPrimary}`}>
          <PlugZap className="h-4 w-4" /> Connectors Control
        </h2>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${textSecondary}`}>
            {connectors.length} integrations
          </span>
          {close && (
            <button
              onClick={close}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                isDark ? "bg-neutral-800 text-white hover:bg-neutral-700" : "bg-neutral-100 text-black hover:bg-neutral-200"
              }`}
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {connectors.map((connector) => (
          <div key={connector.id} className={`rounded-2xl border ${border} ${surface} p-4 shadow-sm`}>
            <div className="flex items-center justify-between text-sm">
              <p className={`font-semibold ${textPrimary}`}>{connector.name}</p>
              {connector.status === "connected" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : connector.status === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>
            <p className={`mt-1 text-sm ${textSecondary}`}>Last sync {connector.lastSync}</p>
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                connector.status === "connected"
                  ? isDark
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-300 text-black"
                  : connector.status === "warning"
                    ? isDark
                      ? "bg-amber-500 text-white"
                      : "bg-amber-300 text-black"
                    : isDark
                      ? "bg-red-600 text-white"
                      : "bg-red-300 text-black"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              {connector.status}
            </div>
            {connector.status !== "connected" && (
              <button
                className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                  isDark ? "bg-neutral-800 text-white hover:bg-neutral-700" : "bg-neutral-100 text-black hover:bg-neutral-200"
                }`}
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
