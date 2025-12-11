import React from 'react';

const statusStyles = {
  idle: { color: '#9ca3af', glow: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)' },
  running: { color: 'var(--info)', glow: 'rgba(111,124,255,0.4)', border: 'rgba(111,124,255,0.5)' },
  success: { color: 'var(--success)', glow: 'rgba(66,255,179,0.35)', border: 'rgba(66,255,179,0.55)' },
  error: { color: 'var(--danger)', glow: 'rgba(255,94,138,0.35)', border: 'rgba(255,94,138,0.6)' },
};

const formatTime = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleTimeString();
};

const TestRunCard = ({ title, status = 'idle', startedAt, endedAt }) => {
  const palette = statusStyles[status] || statusStyles.idle;
  const isRunning = status === 'running';

  return (
    <div
      className="glass-panel"
      style={{
        padding: 18,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${palette.border}`,
        boxShadow: `0 14px 36px rgba(0,0,0,0.25), 0 0 30px ${palette.glow}`,
      }}
    >
      {isRunning && (
        <div
          style={{
            position: 'absolute',
            inset: -2,
            background: `radial-gradient(circle at 20% 20%, ${palette.glow}, transparent 45%), radial-gradient(circle at 80% 80%, ${palette.glow}, transparent 50%)`,
            filter: 'blur(16px)',
            opacity: 0.4,
            animation: 'pulse 1.6s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        <span
          style={{
            padding: '6px 12px',
            borderRadius: 999,
            border: `1px solid ${palette.border}`,
            color: palette.color,
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            boxShadow: `0 0 14px ${palette.glow}`,
            backdropFilter: 'blur(4px)',
          }}
        >
          {status}
        </span>
      </div>
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, opacity: 0.85 }}>
        <div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>Started</div>
          <div>{formatTime(startedAt)}</div>
        </div>
        <div>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>Ended</div>
          <div>{formatTime(endedAt)}</div>
        </div>
      </div>
    </div>
  );
};

export default TestRunCard;
