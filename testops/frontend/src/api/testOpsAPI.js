const baseUrl = () => window.location.origin;

export async function startTest() {
  const response = await fetch(`${baseUrl()}/tests/run_all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error('Failed to start tests');
  return response.json();
}

export async function getStatus(runId) {
  const response = await fetch(`${baseUrl()}/tests/status/${runId}`);
  if (!response.ok) throw new Error('Failed to load status');
  return response.json();
}

export async function getReport(runId) {
  const response = await fetch(`${baseUrl()}/tests/report/${runId}`);
  if (!response.ok) throw new Error('Failed to load report');
  return response.text();
}

export async function getBundle(runId) {
  const response = await fetch(`${baseUrl()}/tests/bundle/${runId}`);
  if (!response.ok) throw new Error('Failed to download bundle');
  return response.blob();
}
