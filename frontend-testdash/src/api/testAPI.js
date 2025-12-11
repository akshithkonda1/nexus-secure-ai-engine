const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8088';

export async function startRun() {
  const res = await fetch(`${BASE_URL}/tests/run_all`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to start run');
  return res.json();
}

export async function fetchStatus(runId) {
  const res = await fetch(`${BASE_URL}/tests/status/${runId}`);
  if (!res.ok) throw new Error('Status not found');
  return res.json();
}

export async function fetchResult(runId) {
  const res = await fetch(`${BASE_URL}/tests/result/${runId}`);
  if (!res.ok) throw new Error('Result not found');
  return res.json();
}

export function streamRun(runId, onEvent) {
  const source = new EventSource(`${BASE_URL}/tests/stream/${runId}`);
  source.onmessage = (event) => {
    const payload = JSON.parse(event.data);
    onEvent(payload);
  };
  return source;
}

export async function downloadBundle(runId) {
  const res = await fetch(`${BASE_URL}/tests/bundle/${runId}`);
  if (!res.ok) throw new Error('Bundle not available');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${runId}.zip`;
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
