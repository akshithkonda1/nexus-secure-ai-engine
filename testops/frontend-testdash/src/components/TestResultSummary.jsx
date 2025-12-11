import React from 'react';

function TestResultSummary({ summary }) {
  const {
    determinism_score,
    p95_latency,
    pipeline_path_distribution,
    confidence_stats,
  } = summary || {};

  return (
    <div className="metrics-grid">
      <div className="metric">
        <h4>Determinism Score</h4>
        <strong>{determinism_score ?? '—'}</strong>
      </div>
      <div className="metric">
        <h4>p95 Latency</h4>
        <strong>{p95_latency ?? '—'}</strong>
      </div>
      <div className="metric">
        <h4>Pipeline Path Distribution</h4>
        <div>{pipeline_path_distribution ? JSON.stringify(pipeline_path_distribution) : '—'}</div>
      </div>
      <div className="metric">
        <h4>Confidence Stats</h4>
        <div>{confidence_stats ? JSON.stringify(confidence_stats) : '—'}</div>
      </div>
    </div>
  );
}

export default TestResultSummary;
