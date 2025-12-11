import React from 'react';

const LABELS = {
  sim: 'SIM',
  engine_hardening: 'Engine Hardening',
  cloud_hardening: 'Cloud Hardening',
  security_hardening: 'Security + PII',
  load_and_chaos: 'Load & Chaos',
  replay: 'Replay Determinism',
  beta_readiness: 'Beta Readiness',
  public_beta: 'Public Readiness',
};

const COLORS = {
  pending: '#e2e8f0',
  running: '#fde68a',
  pass: '#bbf7d0',
  fail: '#fecdd3',
};

export default function StatusBubbles({ statuses }) {
  return (
    <div className="status-grid">
      {Object.entries(LABELS).map(([key, label]) => {
        const state = statuses?.[key] || 'pending';
        return (
          <div key={key} className="card" style={{ borderLeft: `6px solid ${COLORS[state]}` }}>
            <div style={{ fontSize: 12, color: '#475569' }}>{label}</div>
            <div style={{ fontWeight: 700, textTransform: 'uppercase' }}>{state}</div>
          </div>
        );
      })}
    </div>
  );
}
