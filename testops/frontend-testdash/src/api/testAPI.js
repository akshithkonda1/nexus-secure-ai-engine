const handleResponse = async (res) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
};

export const checkEngineHealth = () => fetch('/engine_health').then(handleResponse);

export const beginSession = (phrase) =>
  fetch('/begin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phrase }),
  }).then(handleResponse);

export const startRunAll = () => fetch('/tests/run_all', { method: 'POST' }).then(handleResponse);

export const fetchStatus = (runId) => fetch(`/tests/status/${runId}`).then(handleResponse);

export const streamLogs = (runId) => new EventSource(`/tests/stream/${runId}`);

export const fetchResult = (runId) => fetch(`/tests/result/${runId}`).then(handleResponse);

export const fetchReport = (runId) => fetch(`/tests/report/${runId}`).then(handleResponse);

export const downloadBundle = (runId) => fetch(`/tests/bundle/${runId}`).then(handleResponse);
