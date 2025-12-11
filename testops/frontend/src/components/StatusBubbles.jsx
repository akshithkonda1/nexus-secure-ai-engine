import React from 'react';

const palette = {
  idle: '#475569',
  running: '#7dd3fc',
  success: '#34d399',
  fail: '#f87171'
};

const labelMap = {
  sim: 'SIM',
  engine: 'Engine',
  load: 'Load',
  replay: 'Replay'
};

const StatusBubbles = ({ statuses = {} }) => {
  return (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      {Object.keys(labelMap).map((key) => {
        const status = statuses[key] || 'idle';
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: palette[status] || palette.idle,
                boxShadow: `0 0 12px ${palette[status] || palette.idle}`
              }}
            ></div>
            <span style={{ fontSize: 13, letterSpacing: '0.02em', color: '#cbd5e1' }}>{labelMap[key]}</span>
          </div>
        );
      })}
    </div>
  );
};

export default StatusBubbles;
