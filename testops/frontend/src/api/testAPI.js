const API_BASE = `${window.location.origin}/testops`;

async function handleResponse(response) {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Request failed');
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

export async function startTests() {
  const response = await fetch(`${API_BASE}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return handleResponse(response);
}

export async function getStatus(runId) {
  const response = await fetch(`${API_BASE}/status/${runId}`);
  return handleResponse(response);
}

export function streamLogs(runId) {
  const url = `${API_BASE}/stream/${runId}`;
  return new EventSource(url);
}

export async function getReport(runId) {
  const response = await fetch(`${API_BASE}/report/${runId}`);
  if (!response.ok) throw new Error('Unable to download report');
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/')) return response.text();
  if (contentType.includes('application/json')) return response.text();
  return response.blob();
}

export async function getSnapshot(runId) {
  const response = await fetch(`${API_BASE}/snapshot/${runId}`);
  return handleResponse(response);
}
