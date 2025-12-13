import React, { useState } from "react";

const sections = [
  { title: "What is Ryuzen", body: "A calm orchestration layer merging cosmic clarity with decisive execution." },
  { title: "Why Ryuzen Exists", body: "To keep frontier teams aligned, transparent, and resilient while the canvas of work keeps expanding." },
  { title: "ALOE Framework", body: "Awareness, Lineage, Outcomes, and Evidence — the backbone for trustworthy AI systems." },
  { title: "Toron", body: "Your conversational strategist that stays gentle yet precise." },
  { title: "Workspace", body: "A central canvas for actions, rituals, and operational visibility." },
  { title: "Design for Transparency", body: "Every interaction is auditable, explainable, and ready for review." },
];

const Home: React.FC = () => {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (title: string) => setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));

  return (
    <div className="glass-panel" style={{ padding: 24, display: "grid", gap: 20 }}>
      <div className="section-header">
        <div>
          <p style={{ margin: 0, color: "var(--text-muted)" }}>Orientation</p>
          <h1 style={{ margin: 4, fontSize: 28 }}>Ryuzen — Cosmic clarity for decisive teams</h1>
        </div>
        <div className="mini-card" style={{ minWidth: 220 }}>
          <div style={{ fontWeight: 700 }}>Status</div>
          <div style={{ color: "var(--text-secondary)" }}>Stable • Production-ready • 21-day ship horizon</div>
        </div>
      </div>

      <div className="home-grid">
        {sections.map((section) => (
          <div className="accordion" key={section.title}>
            <div className="accordion-header" onClick={() => toggle(section.title)}>
              <div>
                <div style={{ fontWeight: 700 }}>{section.title}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Tap to {collapsed[section.title] ? "expand" : "minimize"}</div>
              </div>
              <span aria-hidden>{collapsed[section.title] ? "+" : "-"}</span>
            </div>
            {!collapsed[section.title] && <div className="accordion-body">{section.body}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
