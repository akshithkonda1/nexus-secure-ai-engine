import React from 'react';

const STATUS_COLORS = {
  idle: '#9ca3af',
  pending: '#f59e0b',
  running: '#3b82f6',
  completed: '#22c55e',
  failed: '#ef4444',
};

const StatusBubbles = ({ status }) => {
  const color = STATUS_COLORS[status] || STATUS_COLORS.idle;
  return (
    <div className="status-bubbles">
      <div className="bubble" style={{ backgroundColor: color }} />
      <div className="status-text">Status: {status}</div>
    </div>
  );
};

export default StatusBubbles;
