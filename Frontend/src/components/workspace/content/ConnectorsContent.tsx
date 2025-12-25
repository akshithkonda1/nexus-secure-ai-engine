/**
 * Connectors Content Component
 * Pure content for Connectors window (no shell)
 */

import { ShieldCheck } from 'lucide-react';
import { useWorkspace } from '../../../hooks/useWorkspace';

type ConnectorsContentProps = {
  className?: string;
};

export default function ConnectorsContent({ className }: ConnectorsContentProps) {
  const connectors = useWorkspace(state => state.connectors);
  const toggleConnector = useWorkspace(state => state.toggleConnector);

  const getStatus = (connector: typeof connectors[0]) => {
    if (!connector.connected) return 'Disconnected';
    if (!connector.lastSync) return 'Idle';
    // Handle both Date objects and serialized date strings from localStorage
    const lastSyncDate = connector.lastSync instanceof Date
      ? connector.lastSync
      : new Date(connector.lastSync);
    const minutesSinceSync = (Date.now() - lastSyncDate.getTime()) / (1000 * 60);
    if (minutesSinceSync < 5) return 'Syncing';
    return 'Healthy';
  };

  const connectedCount = connectors.filter(c => c.connected).length;

  return (
    <div className={`flex h-full flex-col gap-3 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">Ecosystems linked</p>
        <span className="flex items-center gap-1 rounded-full bg-[var(--bg-elev)] px-3 py-1 text-xs text-[var(--text-muted)]">
          <ShieldCheck className="h-4 w-4" />
          {connectedCount} connected
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {connectors.map((connector) => (
          <button
            key={connector.id}
            type="button"
            onClick={() => toggleConnector(connector.id)}
            className="flex w-full items-center justify-between rounded-xl bg-[var(--layer-muted)]/80 px-3 py-2 text-left text-sm text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition hover:bg-[var(--bg-elev)]"
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  connector.connected ? 'bg-[var(--accent)]' : 'bg-[var(--muted)]'
                }`}
              />
              <span className="font-medium">{connector.name}</span>
            </div>
            <span className="text-xs text-[var(--text-muted)]">
              {getStatus(connector)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
