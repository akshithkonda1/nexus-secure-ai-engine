import React from "react";
import { AlertTriangle, CheckCircle2, PlugZap } from "lucide-react";
import { WorkspaceConnector } from "@/types/workspace";

interface ConnectorsWidgetProps {
  connectors: WorkspaceConnector[];
  onChange: (next: WorkspaceConnector[]) => void;
  onExpand: () => void;
}

const statusStyles: Record<WorkspaceConnector["status"], string> = {
  connected: "bg-emerald-500 text-textPrimary",
  warning: "bg-amber-400 text-textPrimary",
  error: "bg-red-500 text-textPrimary",
};

const glassPanelClass =
  "bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-2xl px-5 py-4 transition-all duration-300 hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong";

const ConnectorsWidget: React.FC<ConnectorsWidgetProps> = ({ connectors, onExpand }) => {
  return (
    <button
      type="button"
      onClick={onExpand}
      className={`w-full text-left focus:outline-none ${glassPanelClass}`}
    >
      <div className="flex items-center justify-between border-b border-glassBorder pb-3 text-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-textPrimary">
          <PlugZap className="h-4 w-4" /> Connectors
        </div>
        <span className="text-xs font-semibold text-textSecondary">{connectors.length} linked</span>
      </div>
      <div className="space-y-3 pt-3">
        {connectors.slice(0, 4).map((connector) => (
          <div key={connector.id} className={`${glassPanelClass} p-4 shadow-none`}>
            <div className="flex items-center justify-between text-sm font-semibold text-textPrimary">
              <span>{connector.name}</span>
              {connector.status === "connected" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-textMuted">
              <span>Last sync {connector.lastSync}</span>
              <span className={`rounded-full px-3 py-1 font-semibold ${statusStyles[connector.status]}`}>
                {connector.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-b-2xl pt-3 text-sm text-textSecondary">
        <p>OAuth, PATs, and sync logs are available in the fullscreen connector hub.</p>
      </div>
    </button>
  );
};

export default ConnectorsWidget;
