import { useEffect, useState } from "react";

import { testingApi } from "@/services/testingApi";
import type { TestRun } from "@/types/testing";

export default function TestHistory() {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    testingApi
      .history()
      .then((data) => setRuns(data as TestRun[]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Test history</h1>
      {loading && <p className="text-[var(--text-secondary)]">Loading…</p>}
      <div className="overflow-x-auto rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_80%,transparent)]">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="text-[var(--text-secondary)]">
              <th className="px-3 py-2">Run ID</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Scope</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Created</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.run_id} className="border-t border-[var(--border-soft)]">
                <td className="px-3 py-2 font-mono">{run.run_id}</td>
                <td className="px-3 py-2">{run.test_type}</td>
                <td className="px-3 py-2">{run.scope}</td>
                <td className="px-3 py-2">{run.status}</td>
                <td className="px-3 py-2 text-[var(--text-secondary)]">{run.created_at}</td>
              </tr>
            ))}
            {runs.length === 0 && !loading && (
              <tr>
                <td className="px-3 py-3 text-[var(--text-secondary)]" colSpan={5}>
                  No history yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
