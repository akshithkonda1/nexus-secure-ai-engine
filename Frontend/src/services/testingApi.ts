import type { SnapshotRecord } from "@/types/testing";

const BASE = import.meta.env.VITE_TORON_API_BASE || "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }

  return response.json() as Promise<T>;
}

export const testingApi = {
  runSim: (scenario: string) => request("/tests/sim/run", { method: "POST", body: JSON.stringify({ scenario }) }),
  runSimBatch: (scenarios: string[]) =>
    request("/tests/sim/batch", { method: "POST", body: JSON.stringify({ scenarios }) }),
  runSimFull: () => request("/tests/sim/full", { method: "POST" }),
  runSimStress: (concurrency: number, duration_seconds: number) =>
    request("/tests/sim/stress", {
      method: "POST",
      body: JSON.stringify({ concurrency, duration_seconds }),
    }),
  runSimReplay: (seed_run_id?: string, snapshot_id?: string) =>
    request("/tests/sim/replay", {
      method: "POST",
      body: JSON.stringify({ seed_run_id, snapshot_id }),
    }),
  runLoad: (profile: string, virtual_users: number, duration_seconds: number) =>
    request("/tests/load/run", {
      method: "POST",
      body: JSON.stringify({ profile, virtual_users, duration_seconds }),
    }),
  runCustomLoad: (profile_name: string, rps_target: number, duration_seconds: number) =>
    request("/tests/load/custom", {
      method: "POST",
      body: JSON.stringify({ profile_name, rps_target, duration_seconds }),
    }),
  scrubTelemetry: (note: string) =>
    request("/tests/telemetry/scrub", { method: "POST", body: JSON.stringify({ note }) }),
  quarantineTelemetry: (reason: string, signals: string[]) =>
    request("/tests/telemetry/quarantine", {
      method: "POST",
      body: JSON.stringify({ reason, signals }),
    }),
  engineTier: (tier: string) => request("/tests/engine/tier", { method: "POST", body: JSON.stringify({ tier }) }),
  engineMal: (payload: Record<string, unknown>) =>
    request("/tests/engine/mal", { method: "POST", body: JSON.stringify({ payload }) }),
  engineDeterminism: (runs: number) =>
    request("/tests/engine/determinism", { method: "POST", body: JSON.stringify({ runs }) }),
  engineSnapshotValidate: (snapshot_id: string) =>
    request("/tests/engine/snapshot-validate", { method: "POST", body: JSON.stringify({ snapshot_id }) }),
  history: () => request("/tests/history"),
  snapshots: () => request<SnapshotRecord[]>("/tests/snapshots"),
  snapshot: (id: string) => request<SnapshotRecord>(`/tests/snapshot/${id}`),
  diffSnapshots: (source_id: string, target_id: string) =>
    request("/tests/snapshot/diff", { method: "POST", body: JSON.stringify({ source_id, target_id }) }),
  metricsLive: () => request("/metrics/live"),
  metricsStability: () => request("/metrics/stability"),
  metricsLoad: (runId: string) => request(`/metrics/load/${runId}`),
  warRoom: () => request("/metrics/war-room"),
};
