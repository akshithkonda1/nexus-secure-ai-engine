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

export const beginSession = () => fetch('/begin', { method: 'POST' }).then(handleResponse);

export const startRunAll = () => fetch('/run_all', { method: 'POST' }).then(handleResponse);

export const fetchStatus = (runId) => fetch(`/status/${runId}`).then(handleResponse);

export const streamLogs = (runId) => new EventSource(`/stream/${runId}`);

export const fetchResult = (runId) => fetch(`/result/${runId}`).then(handleResponse);

export const fetchReport = (runId) => fetch(`/report/${runId}`).then(handleResponse);

export const downloadBundle = (runId) => fetch(`/bundle/${runId}`).then(handleResponse);
