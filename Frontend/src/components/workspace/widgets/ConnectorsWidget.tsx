import { Link2, Circle } from "lucide-react";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { useWindowManager } from "../../../hooks/useWindowManager";

export interface ConnectorsWidgetProps {
  className?: string;
}

export default function ConnectorsWidget({ className }: ConnectorsWidgetProps) {
  const { connectors, toggleConnector } = useWorkspace();
  const { openWindow } = useWindowManager();

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

  const formatLastSync = (date?: Date) => {
    if (!date) return "Never";
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const hasAlerts = connectors.some(c => c.status === 'error');

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
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => toggleConnector(connector.id)}
            className="group w-full flex items-center justify-between rounded-lg bg-[var(--bg-elev)]/40 p-3 transition-colors hover:bg-[var(--bg-elev)]/60"
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
                  {connector.status === 'connected' && connector.lastSync
                    ? `Synced ${formatLastSync(connector.lastSync)}`
                    : getStatusText(connector.status)}
                </p>
              </div>
            </div>

            {/* Status badge */}
            <span className={`text-xs font-medium ${getStatusColor(connector.status)}`}>
              {getStatusText(connector.status)}
            </span>
          </button>
        ))}

        {connectors.length === 0 && (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            No connectors configured
          </div>
        )}
      </div>

      {/* Footer note */}
      <p className="text-xs text-[var(--text-muted)] italic">
        Ecosystems linked
      </p>
    </section>
  );
}
