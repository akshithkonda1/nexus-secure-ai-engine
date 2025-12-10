import { useEffect, useState } from "react";

import { testingApi } from "@/services/testingApi";

interface StabilityMetrics {
  stability: number;
  total_cases: number;
  passed: number;
  failed: number;
}

export default function Stability() {
  const [metrics, setMetrics] = useState<StabilityMetrics | null>(null);

  useEffect(() => {
    testingApi.metricsStability().then((data) => setMetrics(data as StabilityMetrics));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Stability metrics</h1>
      {metrics ? (
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[{ label: "Stability", value: `${metrics.stability}%` }, { label: "Total cases", value: metrics.total_cases }, { label: "Passed", value: metrics.passed }, { label: "Failed", value: metrics.failed }].map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_85%,transparent)] p-4"
            >
              <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
              <p className="text-3xl font-bold">{item.value}</p>
            </article>
          ))}
        </section>
      ) : (
        <p className="text-[var(--text-secondary)]">Loading…</p>
      )}
      <section className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_80%,transparent)] p-4">
        <h2 className="text-xl font-semibold">Insights</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--text-secondary)]">
          <li>Replay and determinism checks run offline for reproducibility.</li>
          <li>Snapshots validate regression risk before promoting engine tiers.</li>
          <li>Telemetry quarantine keeps noisy signals out of war-room views.</li>
        </ul>
      </section>
    </div>
  );
}
