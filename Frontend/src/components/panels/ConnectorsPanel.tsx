import React from "react";
import { CheckCircle2, RefreshCcw, ScrollText, WifiOff } from "lucide-react";
import { WorkspaceConnector } from "@/types/workspace";

interface ConnectorsPanelProps {
  connectors: WorkspaceConnector[];
  onChange: (next: WorkspaceConnector[]) => void;
}

const ConnectorCard: React.FC<{ connector: WorkspaceConnector; onReconnect: () => void }> = ({ connector, onReconnect }) => (
  <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
    <div className="flex items-center justify-between text-sm font-semibold text-white/90">
      {connector.name}
      {connector.status === "connected" ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <WifiOff className="h-5 w-5 text-red-300" />}
    </div>
    <p className="mt-1 text-xs text-white/60">Status: {connector.status}</p>
    <p className="text-xs text-white/60">Last sync {connector.lastSync}</p>
    <div className="mt-3 flex items-center gap-2 text-xs text-white/70">
      <ScrollText className="h-4 w-4" /> Recent logs synced to Toron
    </div>
    <button
      className="mt-3 flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/20"
      onClick={onReconnect}
    >
      <RefreshCcw className="h-4 w-4" /> Manual sync
    </button>
  </div>
);

const ConnectorsPanel: React.FC<ConnectorsPanelProps> = ({ connectors, onChange }) => {
  const reconnect = (id: string) => {
    const next = connectors.map((c) => (c.id === id ? { ...c, status: "connected", lastSync: "Just now" } : c));
    onChange(next);
    window.dispatchEvent(new CustomEvent("toron-signal", { detail: { connectors: next } }));
  };

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl">
      <div className="mb-4 text-sm uppercase tracking-[0.2em] text-white/70">Connector Panel</div>
      <div className="grid gap-3 md:grid-cols-2">
        {connectors.map((connector) => (
          <ConnectorCard key={connector.id} connector={connector} onReconnect={() => reconnect(connector.id)} />
        ))}
      </div>
    </div>
  );
};

export default ConnectorsPanel;
