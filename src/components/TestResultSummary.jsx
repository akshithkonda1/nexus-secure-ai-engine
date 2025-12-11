import React from 'react';

const MetricBar = ({ label, value, color }) => {
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
        <span>{label}</span>
        <span style={{ color }}>{value}</span>
      </div>
      <svg width="100%" height="8" style={{ filter: 'drop-shadow(0 0 6px rgba(111,124,255,0.6))' }}>
        <defs>
          <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.85" />
            <stop offset="100%" stopColor="#6f7cff" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="100%" height="8" rx="4" fill="rgba(255,255,255,0.08)" />
        <rect x="0" y="0" width={`${value}`} height="8" rx="4" fill={`url(#grad-${label})`} />
      </svg>
    </div>
  );
};

const TestResultSummary = ({
  results = {
    confidenceScores: 0,
    determinismScore: 0,
    pipelineUsage: 'n/a',
    p95Latency: '—',
    contradictions: 0,
  },
}) => {
  return (
    <div
      className="glass-panel"
      style={{
        padding: 20,
        background: 'linear-gradient(145deg, rgba(111,124,255,0.08), rgba(98,0,234,0.04))',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.35), 0 0 28px rgba(111,124,255,0.25)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>Mission Debrief</h3>
        <span style={{ color: '#9ca3af', fontSize: 13 }}>Automated roll-up</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, alignItems: 'center' }}>
        <div style={{ display: 'grid', gap: 12 }}>
          <MetricBar label="Confidence" value={`${results.confidenceScores || 0}%`} color="var(--success)" />
          <MetricBar label="Determinism" value={`${results.determinismScore || 0}%`} color="var(--info)" />
          <MetricBar label="Contradictions" value={`${results.contradictions || 0}`} color="var(--danger)" />
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 14,
            padding: 14,
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ fontSize: 12, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pipeline</div>
          <div style={{ fontSize: 16, marginTop: 4 }}>{results.pipelineUsage || 'n/a'}</div>
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
            <span style={{ color: '#9ca3af' }}>p95 latency</span>
            <span style={{ color: 'var(--accent)' }}>{results.p95Latency || '—'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestResultSummary;
