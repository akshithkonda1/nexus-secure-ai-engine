import { Link2, ShieldCheck } from "lucide-react";

type ConnectorsWidgetProps = {
  className?: string;
};

const connectors = [
  { name: "GitHub", status: "Healthy" },
  { name: "Notion", status: "Idle" },
  { name: "Linear", status: "Listening" },
];

export default function ConnectorsWidget({ className }: ConnectorsWidgetProps) {
  return (
    <section
      aria-label="Connectors widget"
      className={`flex min-w-[clamp(260px,22vw,360px)] flex-col gap-3 rounded-2xl bg-[var(--bg-surface)]/65 p-4 text-[var(--text)] shadow-[0_18px_60px_-65px_rgba(0,0,0,0.8)] backdrop-blur-xl ${className ?? ""}`}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--layer-muted)] text-[var(--accent)] ring-1 ring-[var(--line-subtle)]/50">
            <Link2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Connectors</p>
            <p className="text-xs text-[var(--text-muted)]">Ecosystems linked</p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-[var(--bg-elev)] px-3 py-1 text-xs text-[var(--text-muted)]">
          <ShieldCheck className="h-4 w-4" />
          No alerts
        </span>
      </header>
      <div className="space-y-2 overflow-y-auto">
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
    </section>
  );
}
