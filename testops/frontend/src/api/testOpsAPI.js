const BASE = "http://127.0.0.1:8000/tests";

export async function runAllTests() {
  const res = await fetch(`${BASE}/run_all`, { method: "POST" });
  return await res.json();
}

export async function fetchStatus(run_id) {
  const res = await fetch(`${BASE}/status/${run_id}`);
  return await res.json();
}

export function streamLogs(run_id, onMessage) {
  const evtSource = new EventSource(`${BASE}/stream/${run_id}`);
  evtSource.onmessage = (e) => onMessage(e.data);
  return evtSource;
}

export async function fetchResult(run_id) {
  const res = await fetch(`${BASE}/result/${run_id}`);
  return await res.json();
}
