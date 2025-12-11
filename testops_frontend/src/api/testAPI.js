export async function runAllTests() {
  const resp = await fetch('/tests/run_all', { method: 'POST' })
  if (!resp.ok) throw new Error('Failed to trigger tests')
  return resp.json()
}

export async function fetchStatus(runId) {
  const resp = await fetch(`/tests/status/${runId}`)
  if (!resp.ok) throw new Error('Status unavailable')
  return resp.json()
}

export async function fetchResult(runId) {
  const resp = await fetch(`/tests/result/${runId}`)
  if (!resp.ok) throw new Error('Result unavailable')
  return resp.json()
}

export async function fetchReport(runId) {
  return `/tests/report/${runId}`
}

export async function fetchBundle(runId) {
  const resp = await fetch(`/tests/bundle/${runId}`)
  if (!resp.ok) throw new Error('Bundle unavailable')
  return resp.json()
}
