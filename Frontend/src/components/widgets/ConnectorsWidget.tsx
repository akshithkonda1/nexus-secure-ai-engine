import React from "react";
import { AlertTriangle, CheckCircle2, PlugZap, RefreshCcw } from "lucide-react";
import { WorkspaceConnector } from "@/types/workspace";

interface ConnectorsWidgetProps {
  connectors: WorkspaceConnector[];
  onChange: (next: WorkspaceConnector[]) => void;
  onExpand: () => void;
}

const statusStyles: Record<WorkspaceConnector["status"], string> = {
  connected: "bg-emerald-500/20 text-emerald-100 border-emerald-500/30",
  warning: "bg-yellow-500/20 text-yellow-100 border-yellow-500/40",
  error: "bg-red-500/20 text-red-100 border-red-500/40",
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
      className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/10 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl transition hover:scale-[1.02] hover:border-white/20"
      onClick={onExpand}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-white/10" />
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60">
          <PlugZap className="h-4 w-4" /> Connectors
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">{connectors.length} linked</span>
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
            className="min-w-[140px] rounded-2xl border border-white/10 bg-white/5 p-3 shadow-inner backdrop-blur-xl"
          >
            <div className="flex items-center justify-between text-sm font-semibold text-white/90">
              {connector.name}
              {connector.status === "connected" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : connector.status === "warning" ? (
                <AlertTriangle className="h-4 w-4 text-yellow-300" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-300" />
              )}
            </div>
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] ${statusStyles[connector.status]}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
              {connector.status}
            </div>
            <p className="mt-2 text-xs text-white/60">Last sync {connector.lastSync}</p>
            {connector.status !== "connected" && (
              <button
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs text-white transition hover:bg-white/20"
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
