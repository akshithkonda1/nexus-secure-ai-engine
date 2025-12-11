import React, { useState } from 'react'

export default function ReportViewer() {
  const [runId, setRunId] = useState('')
  return (
    <div className="card">
      <h2>Report Viewer</h2>
      <div className="controls-row">
        <input value={runId} onChange={(e) => setRunId(e.target.value)} placeholder="Enter run id" />
        <a className="pill" href={runId ? `/tests/report/${runId}` : '#'} target="_blank" rel="noreferrer">View Report</a>
        <a className="pill" href={runId ? `/tests/bundle/${runId}` : '#'} target="_blank" rel="noreferrer">Download Pack</a>
      </div>
    </div>
  )
}
