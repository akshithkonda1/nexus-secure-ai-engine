import React from 'react';

const palette = {
  idle: '#475569',
  running: '#22d3ee',
  done: '#22c55e',
  failed: '#f87171'
};

const labels = [
  ['simSuite', 'SIM Suite'],
  ['loadTest', 'Load Test'],
  ['replay', 'Replay'],
  ['engineValidation', 'Engine Validation']
];

const StatusBubbles = ({ statuses = {} }) => {
  return (
    <div className="status-bubbles">
      {labels.map(([key, label]) => {
        const state = statuses[key] || 'idle';
        const color = palette[state] || palette.idle;
        return (
          <div className="status-chip" key={key}>
            <span className="bubble" style={{ background: color, boxShadow: `0 0 16px ${color}` }}></span>
            <span className="status-text">{label}</span>
            <span className="status-pill">{state}</span>
          </div>
        );
      })}
    </div>
  );
};

export default StatusBubbles;
