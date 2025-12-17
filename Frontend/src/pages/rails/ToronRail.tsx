const status = [
  { label: "Latency", value: "Stable" },
  { label: "Safety", value: "Strict" },
  { label: "Logging", value: "Enabled" },
];

export default function ToronRail() {
  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm font-semibold text-[var(--text-strong)]">Session status</div>
      <div className="flex flex-col gap-2.5">
        {status.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-xl border border-white/30 bg-white/70 px-3.5 py-2.5 text-sm shadow-[0_12px_34px_rgba(15,23,42,0.08)] backdrop-blur-md dark:border-white/10 dark:bg-white/5"
          >
            <span className="text-[var(--text-muted)]">{item.label}</span>
            <span className="text-[var(--text-primary)]">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
