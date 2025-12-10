import { useState } from "react";

import { testingApi } from "@/services/testingApi";

export default function ReplayEngine() {
  const [runId, setRunId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const triggerReplay = async () => {
    const result = await testingApi.runSimReplay(runId ?? undefined);
    setMessage(`Replay run ${result.run_id} validated snapshot ${result.snapshot_id}`);
  };

  const validate = async () => {
    if (!runId) return;
    const response = await testingApi.engineSnapshotValidate(runId);
    setMessage(`Validated snapshot ${response.snapshot_id}: ${response.summary}`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Replay engine</h1>
      <div className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_80%,transparent)] p-4 space-y-3">
        <div className="space-y-2">
          <label className="text-sm text-[var(--text-secondary)]">Seed snapshot ID</label>
          <input
            value={runId ?? ""}
            onChange={(e) => setRunId(e.target.value)}
            placeholder="SNAP-00001"
            className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--panel-strong)] px-3 py-2"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={triggerReplay}
            className="rounded-lg bg-[var(--accent-primary)] px-3 py-2 font-semibold text-black shadow"
          >
            Trigger replay
          </button>
          <button
            type="button"
            onClick={validate}
            className="rounded-lg border border-[var(--border-soft)] px-3 py-2"
          >
            Validate snapshot
          </button>
          <button
            type="button"
            onClick={() => testingApi.engineDeterminism(3).then((r) => setMessage(`Determinism check ${r.run_id}`))}
            className="rounded-lg border border-[var(--border-soft)] px-3 py-2"
          >
            Determinism
          </button>
        </div>
        {message && <p className="text-sm text-[var(--text-secondary)]">{message}</p>}
      </div>
    </div>
  );
}
