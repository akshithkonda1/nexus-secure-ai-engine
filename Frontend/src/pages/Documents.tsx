import React from "react";

const Documents: React.FC = () => {
  const docs = [
    { name: "Trust report", updated: "Today", owner: "Nova" },
    { name: "Workspace playbook", updated: "Yesterday", owner: "Team" },
  ];

  return (
    <div className="glass-panel" style={{ padding: 20, display: "grid", gap: 14 }}>
      <div className="section-header">
        <h2 style={{ margin: 0 }}>Documents</h2>
        <span style={{ color: "var(--text-secondary)" }}>Ambient, minimal, functional</span>
      </div>
      <div className="home-grid">
        {docs.map((doc) => (
          <div key={doc.name} className="stub-card">
            <div style={{ fontWeight: 700 }}>{doc.name}</div>
            <div style={{ color: "var(--text-secondary)" }}>Updated {doc.updated}</div>
            <div style={{ color: "var(--text-muted)" }}>Owner: {doc.owner}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;
