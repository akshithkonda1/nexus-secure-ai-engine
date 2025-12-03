import React from "react";
import { AlertTriangle, CheckCircle2, PlugZap } from "lucide-react";
import { WorkspaceConnector } from "@/types/workspace";
import { useTheme } from "@/theme/ThemeProvider";

interface ConnectorsWidgetProps {
  connectors: WorkspaceConnector[];
  onChange: (next: WorkspaceConnector[]) => void;
  onExpand: () => void;
}

const statusStyles: Record<WorkspaceConnector["status"], string> = {
  connected: "bg-emerald-300 text-textPrimary dark:bg-emerald-600 dark:text-textPrimary",
  warning: "bg-amber-300 text-textPrimary dark:bg-amber-500 dark:text-textPrimary",
  error: "bg-red-300 text-textPrimary dark:bg-red-600 dark:text-textPrimary",
};

const ConnectorsWidget: React.FC<ConnectorsWidgetProps> = ({ connectors, onExpand }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={onExpand}
      className={`w-full rounded-3xl border text-left shadow-sm transition hover:scale-[1.01] ${
        isDark ? "border-borderLight/10 bg-bgElevated text-textPrimary" : "border-borderLight/5 bg-bgPrimary text-textPrimary"
      }`}
    >
      <div className="flex items-center justify-between border-b px-5 py-4 text-sm">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-textPrimary dark:text-textMuted">
          <PlugZap className="h-4 w-4" /> Connectors
        </div>
        <span className="text-xs font-semibold text-textSecondary dark:text-textMuted">{connectors.length} linked</span>
      </div>
      <div className="space-y-3 px-5 py-4">
        {connectors.slice(0, 4).map((connector) => (
          <div
            key={connector.id}
            className={`rounded-2xl border px-4 py-3 shadow-sm ${
              isDark ? "border-borderLight/10 bg-bgElevated" : "border-borderLight/5 bg-bgPrimary"
            }`}
          >
            <div className="flex items-center justify-between text-sm font-semibold text-textPrimary dark:text-textMuted">
              <span>{connector.name}</span>
              {connector.status === "connected" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-textSecondary dark:text-textMuted">
              <span>Last sync {connector.lastSync}</span>
              <span className={`rounded-full px-3 py-1 font-semibold ${statusStyles[connector.status]}`}>
                {connector.status}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className={`rounded-b-3xl px-5 py-3 text-sm ${isDark ? "bg-bgElevated" : "bg-bgPrimary"}`}>
        <p className="text-textSecondary dark:text-textMuted">
          OAuth, PATs, and sync logs are available in the fullscreen connector hub.
        </p>
      </div>
    </button>
  );
};

export default ConnectorsWidget;
