import React from 'react';

const DISPLAY = [
  { key: 'latency_heatmap', label: 'Latency Heatmap' },
  { key: 'determinism', label: 'Determinism Score' },
  { key: 'tier_stability', label: 'Tier Stability' },
  { key: 'chaos_resilience', label: 'Chaos Resilience' },
  { key: 'pii_compliance', label: 'PII Compliance' },
  { key: 'multi_cloud', label: 'Multi-Cloud Score' },
  { key: 'beta', label: 'Beta Readiness Score' },
  { key: 'public', label: 'Public Readiness Score' },
];

export default function TestResultSummary({ summary }) {
  const values = {
    latency_heatmap: summary?.sim?.metrics?.latency_heatmap || '—',
    determinism: summary?.replay?.metrics?.determinism ?? '—',
    tier_stability: summary?.engine_hardening?.metrics?.tier_stability ?? '—',
    chaos_resilience: summary?.load_and_chaos?.metrics?.chaos_resilience ?? '—',
    pii_compliance: summary?.security_hardening?.metrics?.pii_compliance ?? '—',
    multi_cloud: summary?.cloud_hardening?.metrics?.multi_cloud ?? '—',
    beta: summary?.beta_readiness?.metrics?.score ?? '—',
    public: summary?.public_beta?.metrics?.score ?? '—',
  };

  return (
    <div className="card">
      <h4 style={{ marginTop: 0 }}>Final Summary</h4>
      <div className="summary-grid">
        {DISPLAY.map((item) => (
          <div key={item.key} className="summary-card card">
            <h4>{item.label}</h4>
            <div className="value">{values[item.key]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
