import React from "react";

const History: React.FC = () => {
  const entries = [
    { item: "Toron response regenerated", time: "2m ago" },
    { item: "Workspace ritual completed", time: "1h ago" },
    { item: "Document shared", time: "3h ago" },
  ];

  return (
    <div className="glass-panel" style={{ padding: 20, display: "grid", gap: 12 }}>
      <div className="section-header">
        <h2 style={{ margin: 0 }}>History</h2>
        <span style={{ color: "var(--text-secondary)" }}>Everything stays visible</span>
      </div>
      <div className="chat-stream">
        {entries.map((entry) => (
          <div key={entry.item} className="mini-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>{entry.item}</span>
            <span style={{ color: "var(--text-muted)" }}>{entry.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
