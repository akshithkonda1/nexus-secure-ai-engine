import React from 'react'

export default function TestResultSummary({ result }) {
  if (!result) return null
  return (
    <div className="summary">
      <h3>Final Results</h3>
      <div className="summary-grid">
        {Object.entries(result.metrics || {}).map(([key, value]) => (
          <div key={key} className="summary-item">
            <p className="label">{key}</p>
            <p className="value">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
