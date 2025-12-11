const API_BASE =
  import.meta.env.VITE_TESTOPS_API_BASE || "http://localhost:8000";

export async function runAllTests() {
  const res = await fetch(`${API_BASE}/tests/run_all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: "full_suite" }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`run_all failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function getTestStatus(runId) {
  const res = await fetch(`${API_BASE}/tests/status/${runId}`);

  if (!res.ok) {
    throw new Error("status failed");
  }

  return res.json();
}

export function streamLogs(runId, onMessage) {
  const evt = new EventSource(`${API_BASE}/tests/stream/${runId}`);

  evt.onmessage = (ev) => onMessage(ev.data);
  evt.onerror = () => evt.close();

  return evt;
}
