import { useState } from "react";

import { testingApi } from "@/services/testingApi";

interface LoadMetrics {
  run_id?: string;
  status?: string;
  profile?: string;
  tps?: number;
  errors?: number;
  duration?: number;
  created_at?: string;
}

export default function LoadTests() {
  const [currentRun, setCurrentRun] = useState<string>("");
  const [metrics, setMetrics] = useState<LoadMetrics>({});
  const [status, setStatus] = useState<string>("");

  const triggerLoad = async () => {
    const run = await testingApi.runLoad("ci-smoke", 15, 60);
    setCurrentRun(run.run_id);
    setStatus(`Run ${run.run_id} queued`);
    const result = await testingApi.metricsLoad(run.run_id);
    setMetrics(result as LoadMetrics);
  };

  const refresh = async () => {
    if (!currentRun) return;
    const result = await testingApi.metricsLoad(currentRun);
    setMetrics(result as LoadMetrics);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Load tests</h1>
        <button
          type="button"
          onClick={triggerLoad}
          className="rounded-lg bg-[var(--accent-primary)] px-3 py-2 font-semibold text-black shadow"
        >
          Run load test
        </button>
      </div>
      {status && <p className="text-[var(--text-secondary)]">{status}</p>}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[{ label: "Profile", value: metrics.profile ?? "–" }, { label: "TPS", value: metrics.tps ?? 0 }, { label: "Errors", value: metrics.errors ?? 0 }].map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_85%,transparent)] p-4"
          >
            <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
            <p className="text-2xl font-bold">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_80%,transparent)] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Run details</h2>
          <button
            type="button"
            onClick={refresh}
            className="rounded-lg border border-[var(--border-soft)] px-3 py-2"
          >
            Refresh
          </button>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <div>
            <dt className="text-[var(--text-secondary)]">Run ID</dt>
            <dd className="font-mono">{metrics.run_id ?? "–"}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)]">Status</dt>
            <dd>{metrics.status ?? "–"}</dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)]">Duration</dt>
            <dd>{metrics.duration ?? 0}s</dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)]">Created</dt>
            <dd>{metrics.created_at ?? "–"}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
