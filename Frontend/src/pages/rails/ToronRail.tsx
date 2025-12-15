const status = [
  { label: "Latency", value: "Stable" },
  { label: "Safety", value: "Strict" },
  { label: "Logging", value: "Enabled" },
];

export default function ToronRail() {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-semibold text-[var(--text-strong)]">Session status</div>
      <div className="flex flex-col gap-2">
        {status.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl border border-[var(--line-subtle)] bg-[var(--layer-muted)] px-3 py-2 text-sm"
          >
            <span className="text-[var(--text-muted)]">{item.label}</span>
            <span className="text-[var(--text-primary)]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
