import React from 'react';

export default function ProgressBar({ progress = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  return (
    <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-inner" style={{ width: `${pct}%` }} />
    </div>
  );
}
