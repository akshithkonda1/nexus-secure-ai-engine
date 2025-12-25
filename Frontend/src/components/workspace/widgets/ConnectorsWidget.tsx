import { Link2, Circle } from "lucide-react";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { useWindowManager } from "../../../hooks/useWindowManager";

export interface ConnectorsWidgetProps {
  className?: string;
}

export default function ConnectorsWidget({ className }: ConnectorsWidgetProps) {
  const { connectors, toggleConnector } = useWorkspace();
  const { openWindow } = useWindowManager();

export default function ConnectorsWidget({ className = "" }: ConnectorsWidgetProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "text-green-500";
      case "disconnected":
        return "text-gray-500";
      case "error":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Healthy";
      case "disconnected":
        return "Idle";
      case "error":
        return "Error";
      default:
        return "Unknown";
    }
  };

  const hasAlerts = false; // No errors in sample data

  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl ${className}`}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between cursor-pointer hover:bg-[var(--bg-elev)]/30 -mx-2 -mt-2 px-2 pt-2 pb-1 rounded-t-xl transition-colors"
        onClick={() => openWindow('connectors')}
        title="Click to expand"
      >
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Connectors</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {hasAlerts && (
            <Circle className="h-2 w-2 fill-red-500 text-red-500 animate-pulse" />
          )}
          <span className="text-xs text-[var(--text-muted)]">
            {hasAlerts ? "Alerts" : "No alerts"}
          </span>
        </div>
      </header>

      {/* Connectors list */}
      <div className="space-y-2">
        {sampleConnectors.map((connector) => (
          <div
            key={connector.id}
            className="flex items-center justify-between rounded-lg bg-[var(--bg-elev)]/40 p-3 transition-colors hover:bg-[var(--bg-elev)]/60"
          >
            {/* Connector info */}
            <div className="flex items-center gap-3">
              <Circle
                className={`h-2 w-2 fill-current ${getStatusColor(connector.status)}`}
              />
              <div className="text-left">
                <h3 className="text-sm font-medium text-[var(--text)]">
                  {connector.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {getStatusText(connector.status)}
                </p>
              </div>
            </div>

            {/* Status badge */}
            <span className={`text-xs font-medium ${getStatusColor(connector.status)}`}>
              {getStatusText(connector.status)}
            </span>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-[var(--text-muted)] italic">Ecosystems linked</p>
    </section>
  );
}
