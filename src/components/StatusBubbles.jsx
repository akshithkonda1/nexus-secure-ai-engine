import React from 'react';

const bubblePalette = {
  pending: { color: '#6b7280', glow: 'rgba(255,255,255,0.08)' },
  running: { color: 'var(--info)', glow: 'rgba(91,213,255,0.35)' },
  success: { color: 'var(--success)', glow: 'rgba(66,255,179,0.4)' },
  fail: { color: 'var(--danger)', glow: 'rgba(255,94,138,0.35)' },
};

const statusLabel = {
  sim_suite: 'SIM Suite',
  engine_validation: 'Engine Validation',
  replay_determinism: 'Replay Determinism',
  load_test: 'Load Test',
};

const StatusBubbles = ({ status = {} }) => {
  const entries = Object.keys(statusLabel).map((key) => ({
    key,
    label: statusLabel[key],
    state: status[key]?.state || 'pending',
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
      {entries.map(({ key, label, state }) => {
        const palette = bubblePalette[state] || bubblePalette.pending;
        return (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: `0 8px 20px rgba(0,0,0,0.2), 0 0 18px ${palette.glow}`,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: 'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                border: `1px solid ${palette.glow}`,
                boxShadow: `0 0 18px ${palette.glow}`,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: palette.color,
                  boxShadow: `0 0 18px ${palette.glow}`,
                  transition: 'transform 0.3s ease',
                }}
              />
            </div>
            <div>
              <div style={{ fontWeight: 700 }}>{label}</div>
              <div style={{ color: '#9ca3af', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{state}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatusBubbles;
