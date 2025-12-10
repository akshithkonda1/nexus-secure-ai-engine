import React from "react";

const LABELS = ["SIM Batch", "Engine Check", "Replay", "Load Test"];

function bubbleColor(state) {
  if (!state) return "neutral";
  if (state === "completed" || state === true || state.status === "completed") return "ok";
  if (state === "failed" || state === false || state.status === "failed") return "error";
  return "active";
}

export default function StatusBubble({ status }) {
  return (
    <div className="status-bubbles" aria-label="Test stage status bubbles">
      {LABELS.map((label) => {
        const key = label.toLowerCase().replace(/\s+/g, "_");
        const state = status?.result?.[key] || status?.status?.phase === key ? status : status?.[key];
        const cls = bubbleColor(state);
        return (
          <div key={label} className={`bubble ${cls}`} role="status" aria-label={`${label} status`}>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
