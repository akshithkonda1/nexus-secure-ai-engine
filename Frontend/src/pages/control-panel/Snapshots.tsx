import { useEffect, useState } from "react";

import { testingApi } from "@/services/testingApi";
import type { SnapshotRecord } from "@/types/testing";

export default function Snapshots() {
  const [snapshots, setSnapshots] = useState<SnapshotRecord[]>([]);
  const [selected, setSelected] = useState<SnapshotRecord | null>(null);
  const [diff, setDiff] = useState<Record<string, unknown> | null>(null);
  const [diffTargets, setDiffTargets] = useState<{ source?: string; target?: string }>({});

  useEffect(() => {
    testingApi.snapshots().then(setSnapshots);
  }, []);

  const viewSnapshot = async (id: string) => {
    const snap = await testingApi.snapshot(id);
    setSelected(snap);
  };

  const runDiff = async () => {
    if (!diffTargets.source || !diffTargets.target) return;
    const result = await testingApi.diffSnapshots(diffTargets.source, diffTargets.target);
    setDiff(result.delta);
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <section className="lg:col-span-2 rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_80%,transparent)] p-4">
        <h1 className="text-2xl font-bold">Snapshots</h1>
        <p className="text-sm text-[var(--text-secondary)]">Inspect saved artifacts from SIM and load runs.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-[var(--text-secondary)]">
                <th className="px-3 py-2">Snapshot</th>
                <th className="px-3 py-2">Run</th>
                <th className="px-3 py-2">Summary</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {snapshots.map((snap) => (
                <tr key={snap.snapshot_id} className="border-t border-[var(--border-soft)]">
                  <td className="px-3 py-2 font-mono">{snap.snapshot_id}</td>
                  <td className="px-3 py-2">{snap.run_id}</td>
                  <td className="px-3 py-2">{snap.summary}</td>
                  <td className="px-3 py-2 text-[var(--text-secondary)]">{snap.created_at}</td>
                  <td className="px-3 py-2">
                    <button
                      className="text-[var(--accent-primary)]"
                      onClick={() => viewSnapshot(snap.snapshot_id)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {snapshots.length === 0 && (
                <tr>
                  <td className="px-3 py-3 text-[var(--text-secondary)]" colSpan={5}>
                    No snapshots yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_85%,transparent)] p-4 space-y-3">
        <h2 className="text-xl font-semibold">Snapshot details</h2>
        {selected ? (
          <div className="space-y-2 text-sm">
            <p className="font-mono text-[var(--text-primary)]">{selected.snapshot_id}</p>
            <p className="text-[var(--text-secondary)]">Run: {selected.run_id}</p>
            <pre className="rounded-lg bg-[var(--panel-elevated)] p-3 text-xs">
              {JSON.stringify(selected.payload, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-[var(--text-secondary)]">Select a snapshot to view payload.</p>
        )}

        <div className="space-y-2">
          <h3 className="font-semibold">Diff snapshots</h3>
          <select
            className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--panel-elevated)] px-3 py-2"
            value={diffTargets.source ?? ""}
            onChange={(e) => setDiffTargets((d) => ({ ...d, source: e.target.value }))}
          >
            <option value="">Source snapshot</option>
            {snapshots.map((snap) => (
              <option key={snap.snapshot_id} value={snap.snapshot_id}>
                {snap.snapshot_id}
              </option>
            ))}
          </select>
          <select
            className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--panel-elevated)] px-3 py-2"
            value={diffTargets.target ?? ""}
            onChange={(e) => setDiffTargets((d) => ({ ...d, target: e.target.value }))}
          >
            <option value="">Target snapshot</option>
            {snapshots.map((snap) => (
              <option key={snap.snapshot_id} value={snap.snapshot_id}>
                {snap.snapshot_id}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={runDiff}
            className="w-full rounded-lg bg-[var(--accent-primary)] px-3 py-2 font-semibold text-black shadow"
          >
            Diff
          </button>
          {diff && (
            <pre className="rounded-lg bg-[var(--panel-elevated)] p-3 text-xs">
              {JSON.stringify(diff, null, 2)}
            </pre>
          )}
        </div>
      </section>
    </div>
  );
}
