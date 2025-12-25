import { Link2, Circle, RefreshCw, Settings } from "lucide-react";
import { useWorkspace } from "../../../hooks/useWorkspace";
import { useWindowManager } from "../../../hooks/useWindowManager";

export interface ConnectorsWidgetProps {
  className?: string;
}

export default function ConnectorsWidget({ className = "" }: ConnectorsWidgetProps) {
  const connectors = useWorkspace((state) => state.connectors);
  const toggleConnector = useWorkspace((state) => state.toggleConnector);
  const syncConnector = useWorkspace((state) => state.syncConnector);
  const openWindow = useWindowManager((state) => state.openWindow);

  const getStatusColor = (connected: boolean) => {
    return connected ? "text-green-500" : "text-gray-500";
  };

  const getStatusText = (connected: boolean) => {
    return connected ? "Healthy" : "Idle";
  };

  const hasAlerts = connectors.some((c) => !c.connected);
  const connectedCount = connectors.filter((c) => c.connected).length;

  const handleHeaderClick = () => {
    openWindow('connectors');
  };

  const handleSync = (e: React.MouseEvent, connectorId: string) => {
    e.stopPropagation();
    syncConnector(connectorId);
  };

  const handleToggle = (e: React.MouseEvent, connectorId: string) => {
    e.stopPropagation();
    toggleConnector(connectorId);
  };

  return (
    <section
      className={`flex flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 backdrop-blur-xl ${className}`}
    >
      {/* Header - Clickable to open window */}
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
          {hasAlerts && (
            <Circle className="h-2 w-2 fill-red-500 text-red-500 animate-pulse" />
          )}
          <span className="text-xs text-[var(--text-muted)]">
            {connectedCount}/{connectors.length}
          </span>
        </div>
      </header>

      {/* Connectors list */}
      <div className="space-y-2">
        {connectors.map((connector) => (
          <div
            key={connector.id}
            className="flex items-center justify-between rounded-lg bg-[var(--bg-elev)]/40 p-3 transition-colors hover:bg-[var(--bg-elev)]/60"
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

            <div className="flex items-center gap-1">
              {connector.connected ? (
                <button
                  onClick={(e) => handleSync(e, connector.id)}
                  className="rounded-md p-1.5 text-green-500 hover:bg-green-500/10 transition-colors"
                  title="Sync now"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={(e) => handleToggle(e, connector.id)}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-500/10 transition-colors"
                  title="Connect"
                >
                  <Settings className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {connectors.length === 0 && (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            No connectors configured
          </div>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex items-center justify-between border-t border-[var(--line-subtle)] pt-2 text-xs text-[var(--text-muted)]">
        <span>{connectedCount} active</span>
        <span className="italic">Ecosystems linked</span>
      </div>
    </section>
  );
}
