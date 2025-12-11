const BASE_URL = 'http://localhost:8000/testops';

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function handleResponse(response) {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Network response was not ok');
  }
  try {
    return await response.json();
  } catch (err) {
    return {};
  }
}

export async function runAllTests() {
  try {
    const res = await fetch(`${BASE_URL}/run`, {
      method: 'POST',
      headers,
    });
    return await handleResponse(res);
  } catch (error) {
    console.error('runAllTests error', error);
    throw error;
  }
}

export async function getStatus(runId) {
  try {
    const res = await fetch(`${BASE_URL}/status/${runId}`, { headers });
    return await handleResponse(res);
  } catch (error) {
    console.error('getStatus error', error);
    throw error;
  }
}

export function getStreamURL(runId) {
  return `${BASE_URL}/stream/${runId}`;
}

export async function getResult(runId) {
  try {
    const res = await fetch(`${BASE_URL}/result/${runId}`, { headers });
    return await handleResponse(res);
  } catch (error) {
    console.error('getResult error', error);
    throw error;
  }
}

export async function getReportHTML(runId) {
  try {
    const res = await fetch(`${BASE_URL}/report/${runId}`, { headers });
    return await handleResponse(res);
  } catch (error) {
    console.error('getReportHTML error', error);
    throw error;
  }
}

export async function getBundle(runId) {
  try {
    const res = await fetch(`${BASE_URL}/bundle/${runId}`, { headers });
    return await handleResponse(res);
  } catch (error) {
    console.error('getBundle error', error);
    throw error;
  }
}
