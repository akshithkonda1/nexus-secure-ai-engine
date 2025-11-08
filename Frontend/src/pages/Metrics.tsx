export function Metrics() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
      <h1 className="text-2xl font-semibold">Metrics</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: "Daily requests", value: "1,502" },
          { label: "Avg. latency", value: "642 ms" },
          { label: "Agreement score", value: "0.83" },
        ].map(m => (
          <div key={m.label} className="rounded-xl border border-white/10 bg-[var(--nexus-card)] p-5">
            <div className="text-sm text-gray-400">{m.label}</div>
            <div className="text-2xl font-semibold">{m.value}</div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/10 bg-[var(--nexus-card)] p-6 text-sm text-gray-300">
        Hook this to real telemetry (New Relic, CloudWatch, custom).
      </div>
    </div>
  );
}
