import React from "react";

export default function LiveLogStream({ lines }) {
  return (
    <div className="live-log" role="log" aria-live="polite">
      {lines && lines.length === 0 && <p className="muted">Waiting for log events…</p>}
      <ul>
        {lines.map((line, idx) => (
          <li key={`${idx}-${line.substring(0, 8)}`}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
