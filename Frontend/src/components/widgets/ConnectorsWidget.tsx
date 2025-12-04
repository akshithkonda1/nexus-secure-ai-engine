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

const surfaceClass =
  "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";

const ConnectorsWidget: React.FC<ConnectorsWidgetProps> = ({ connectors, onExpand }) => {
  return (
    <button
      type="button"
      onClick={onExpand}
      className={`w-full text-left focus:outline-none ${surfaceClass}`}
    >
      <div className="flex items-center justify-between border-b border-neutral-300/60 pb-3 text-sm dark:border-neutral-700/60">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-textPrimary">
          <PlugZap className="h-4 w-4" /> Connectors
        </div>
        <span className="text-xs font-semibold text-textSecondary">{connectors.length} linked</span>
      </div>
      <div className="space-y-3 pt-3">
        {connectors.slice(0, 4).map((connector) => (
          <div key={connector.id} className={`${surfaceClass} p-4`}>
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
