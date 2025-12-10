import React from "react";

export default function ErrorList({ events }) {
  if (!events || events.length === 0) {
    return <p className="muted">No failures logged.</p>;
  }
  const sorted = [...events].sort((a, b) => a.severity.localeCompare(b.severity) || b.timestamp.localeCompare(a.timestamp));
  return (
    <ul className="error-list" aria-label="War Room events">
      {sorted.map((evt, idx) => (
        <li key={`${evt.timestamp}-${idx}`} className={`sev-${evt.severity.toLowerCase()}`}>
          <div>
            <strong>{evt.severity}</strong> — {evt.timestamp}
          </div>
          <div>{evt.message}</div>
        </li>
      ))}
    </ul>
  );
}
