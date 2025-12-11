import React from 'react';

export default function LiveLogStream({ logs }) {
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>Live Log Stream</h4>
        <span style={{ color: '#22c55e', fontWeight: 700 }}>SSE</span>
      </div>
      <div className="log-console" aria-live="polite">
        {logs.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
      </div>
    </div>
  );
}
