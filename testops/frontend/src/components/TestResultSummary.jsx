import React from 'react';

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '200px 1fr',
  padding: '8px 0',
  borderBottom: '1px solid #1f2937',
  color: '#e2e8f0'
};

const labelStyle = {
  color: '#94a3b8',
  textTransform: 'uppercase',
  fontSize: 12,
  letterSpacing: '0.08em'
};

const TestResultSummary = ({ summary }) => {
  if (!summary) return null;
  const fields = [
    ['Latency summary', summary.latency_summary ?? 'n/a'],
    ['Determinism score', summary.determinism_score ?? 'n/a'],
    ['Load test p95', summary.load_p95 ?? 'n/a'],
    ['Confidence avg', summary.confidence_avg ?? 'n/a'],
    ['Snapshot', summary.snapshot_metadata ?? 'n/a']
  ];

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1f2937', borderRadius: '12px', padding: '12px 14px' }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>Results</div>
      {fields.map(([label, value]) => (
        <div key={label} style={rowStyle}>
          <div style={labelStyle}>{label}</div>
          <div>{typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</div>
        </div>
      ))}
    </div>
  );
};

export default TestResultSummary;
