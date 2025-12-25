import { Link2, Circle } from "lucide-react";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { useWindowManager } from "../../../hooks/useWindowManager";

export interface ConnectorsWidgetProps {
  className?: string;
}

export default function ConnectorsWidget({ className = "" }: ConnectorsWidgetProps) {
  const connectors = useWorkspace((state) => state.connectors);
  const toggleConnector = useWorkspace((state) => state.toggleConnector);
  const openWindow = useWindowManager((state) => state.openWindow);

  const getStatusColor = (connected: boolean) => {
    return connected ? "text-green-500" : "text-gray-500";
  };

  const getStatusText = (connected: boolean) => {
    return connected ? "Healthy" : "Idle";
  };

  const hasErrors = false; // Would check for error state in production

  const handleHeaderClick = () => {
    openWindow('connectors');
  };

  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl ${className}`}
    >
      <header
        className="flex items-center justify-between cursor-pointer hover:bg-[var(--bg-elev)]/20 -mx-2 -mt-2 px-2 pt-2 pb-1 rounded-t-xl transition-colors"
        onClick={handleHeaderClick}
        title="Click to expand"
      >
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-[var(--accent)]" />
          <h2 className="text-sm font-semibold text-[var(--text)]">Connectors</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {hasErrors && (
            <Circle className="h-2 w-2 fill-red-500 text-red-500 animate-pulse" />
          )}
          <span className="text-xs text-[var(--text-muted)]">
            {hasErrors ? "Alerts" : "No alerts"}
          </span>
        </div>
      </header>

      <div className="space-y-2">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            onClick={() => toggleConnector(connector.id)}
            className="w-full flex items-center justify-between rounded-lg bg-[var(--bg-elev)]/40 p-3 transition-colors hover:bg-[var(--bg-elev)]/60 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Circle
                className={`h-2 w-2 fill-current ${getStatusColor(connector.connected)}`}
              />
              <div className="text-left">
                <h3 className="text-sm font-medium text-[var(--text)]">
                  {connector.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  {getStatusText(connector.connected)}
                </p>
              </div>
            </div>

            <span className={`text-xs font-medium ${getStatusColor(connector.connected)}`}>
              {getStatusText(connector.connected)}
            </span>
          </button>
        ))}

        {connectors.length === 0 && (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            No connectors configured
          </div>
        )}
      </div>

      <p className="text-xs text-[var(--text-muted)] italic">Ecosystems linked</p>
    </section>
  );
}
