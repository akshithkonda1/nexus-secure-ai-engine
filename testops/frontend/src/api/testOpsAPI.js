const BASE_URL = import.meta.env.VITE_TESTOPS_API_URL || 'http://localhost:8000';

export async function runAllTests() {
  const response = await fetch(`${BASE_URL}/tests/run_all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to start tests');
  }
  return response.json();
}

export async function fetchStatus(runId) {
  const response = await fetch(`${BASE_URL}/tests/status/${runId}`);
  if (!response.ok) {
    throw new Error('Unable to fetch status');
  }
  return response.json();
}

export function createLogStream(runId) {
  const url = `${BASE_URL}/tests/stream/${runId}`;
  return new EventSource(url);
}

export async function validateEngine() {
  const response = await fetch(`${BASE_URL}/tests/validate_engine`);
  if (!response.ok) {
    throw new Error('Engine validation failed');
  }
  return response.json();
}

export default { runAllTests, fetchStatus, createLogStream, validateEngine };
