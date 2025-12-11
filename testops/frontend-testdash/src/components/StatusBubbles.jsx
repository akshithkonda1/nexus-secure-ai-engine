import React from 'react';

const statusColor = (state) => {
  if (state === 'ok' || state === 'pass' || state === true) return 'badge success';
  if (state === 'fail' || state === 'error' || state === false) return 'badge error';
  return 'badge pending';
};

function StatusBubbles({ statuses, keys }) {
  return (
    <div className="status-grid">
      {keys.map((key) => (
        <div key={key} className="status-chip">
          <div className="label">{key}</div>
          <span className={statusColor(statuses?.[key])}>
            {statuses?.[key] === undefined ? '…' : String(statuses[key]).toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default StatusBubbles;
