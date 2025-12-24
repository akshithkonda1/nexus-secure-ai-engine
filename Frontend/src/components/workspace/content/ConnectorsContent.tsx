/**
 * Connectors Content Component
 * Pure content for Connectors window (no shell)
 */

import { ShieldCheck } from 'lucide-react';

const connectors = [
  { name: 'GitHub', status: 'Healthy' },
  { name: 'Notion', status: 'Idle' },
  { name: 'Linear', status: 'Listening' },
];

type ConnectorsContentProps = {
  className?: string;
};

export default function ConnectorsContent({ className }: ConnectorsContentProps) {
  return (
    <div className={`flex h-full flex-col gap-3 ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <p className="text-xs text-[var(--text-muted)]">Ecosystems linked</p>
        <span className="flex items-center gap-1 rounded-full bg-[var(--bg-elev)] px-3 py-1 text-xs text-[var(--text-muted)]">
          <ShieldCheck className="h-4 w-4" />
          No alerts
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto">
        {connectors.map((connector) => (
          <div
            key={connector.name}
            className="flex items-center justify-between rounded-xl bg-[var(--layer-muted)]/80 px-3 py-2 text-sm text-[var(--text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
              <span className="font-medium">{connector.name}</span>
            </div>
            <span className="text-xs text-[var(--text-muted)]">{connector.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
