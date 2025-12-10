import { useEffect, useState } from "react";

import { testingApi } from "@/services/testingApi";
import type { TestRun } from "@/types/testing";

interface LiveMetrics {
  sim_runs?: number;
  load_runs?: number;
  open_events?: number;
  stability?: number;
}

export default function ControlDashboard() {
  const [live, setLive] = useState<LiveMetrics>({});
  const [history, setHistory] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([testingApi.metricsLive(), testingApi.history()])
      .then(([liveMetrics, runs]) => {
        setLive(liveMetrics as LiveMetrics);
        setHistory(runs as TestRun[]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-[var(--text-secondary)]">Ryuzen Toron v2.5H+</p>
          <h1 className="text-3xl font-bold">Testing Control Panel</h1>
        </div>
      </header>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">{error}</div>}

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "SIM runs", value: live.sim_runs ?? 0 },
          { label: "Load runs", value: live.load_runs ?? 0 },
          { label: "Open incidents", value: live.open_events ?? 0 },
          { label: "Stability", value: `${live.stability ?? 100}%` },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_85%,transparent)] p-4"
          >
            <p className="text-sm text-[var(--text-secondary)]">{item.label}</p>
            <p className="pt-2 text-3xl font-bold">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_80%,transparent)] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent test runs</h2>
          {loading && <span className="text-sm text-[var(--text-secondary)]">Loading…</span>}
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-[var(--text-secondary)]">
                <th className="px-3 py-2">Run ID</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Scope</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Duration</th>
                <th className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, 6).map((run) => (
                <tr key={run.run_id} className="border-t border-[var(--border-soft)]">
                  <td className="px-3 py-2 font-mono text-[var(--text-primary)]">{run.run_id}</td>
                  <td className="px-3 py-2 capitalize">{run.test_type}</td>
                  <td className="px-3 py-2">{run.scope}</td>
                  <td className="px-3 py-2">{run.status}</td>
                  <td className="px-3 py-2">{run.duration}s</td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">{run.created_at}</td>
                </tr>
              ))}
              {history.length === 0 && !loading && (
                <tr>
                  <td className="px-3 py-4 text-[var(--text-secondary)]" colSpan={6}>
                    No runs yet. Trigger a SIM or load test from Run Tests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
