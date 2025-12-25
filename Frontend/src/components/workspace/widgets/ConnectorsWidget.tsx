import { Link2, Circle } from "lucide-react";

export interface ConnectorsWidgetProps {
  className?: string;
}

const sampleConnectors = [
  { id: '1', name: 'GitHub', status: 'connected' as const },
  { id: '2', name: 'Notion', status: 'disconnected' as const },
  { id: '3', name: 'Linear', status: 'connected' as const },
];

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

  const hasAlerts = sampleConnectors.some((c) => c.status === 'error');

  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl ${className}`}
    >
      <header className="flex items-center justify-between">
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

      <div className="space-y-2">
        {sampleConnectors.map((connector) => (
          <div
            key={connector.id}
            className="flex items-center justify-between rounded-lg bg-[var(--bg-elev)]/40 p-3 transition-colors hover:bg-[var(--bg-elev)]/60"
          >
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

            <span className={`text-xs font-medium ${getStatusColor(connector.status)}`}>
              {getStatusText(connector.status)}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-[var(--text-muted)] italic">Ecosystems linked</p>
    </section>
  );
}
