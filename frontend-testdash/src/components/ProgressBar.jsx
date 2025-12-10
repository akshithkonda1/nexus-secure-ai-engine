import React from "react";

export default function ProgressBar({ progress = 0 }) {
  const pct = Math.min(100, Math.max(0, progress * 100));
  return (
    <div className="progress" aria-label={`Progress ${pct.toFixed(1)}%`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
      <span className="progress-text">{pct.toFixed(1)}%</span>
    </div>
  );
}
