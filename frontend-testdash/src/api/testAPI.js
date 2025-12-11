const API_BASE = import.meta.env.VITE_TESTOPS_API || "http://localhost:8088";

export async function validateEngine() {
  const res = await fetch(`${API_BASE}/tests/validate_engine`);
  if (!res.ok) throw new Error("Engine validation request failed");
  return res.json();
}

export async function startFullTestSuite() {
  const res = await fetch(`${API_BASE}/tests/run_all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to start test suite");
  return res.json();
}

export async function getRunStatus(runId) {
  const res = await fetch(`${API_BASE}/tests/status/${runId}`);
  if (!res.ok) throw new Error("Status fetch failed");
  return res.json();
}

export function streamLogs(runId, onMessage) {
  const evtSource = new EventSource(`${API_BASE}/tests/stream/${runId}`);
  evtSource.onmessage = (ev) => {
    if (onMessage) onMessage(ev.data);
  };
  return evtSource;
}
