import React from "react";

const PagesPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-[var(--rz-text)]">
      <h2 className="text-2xl font-semibold text-[var(--rz-text)]">Pages</h2>
      <p className="text-[var(--rz-text)]">Craft documents and blueprints for the workspace.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {["Overview", "Playbooks", "Architecture"].map((page) => (
          <div
            key={page}
            className="rounded-2xl border p-4 text-[var(--rz-text)]"
            style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface)" }}
          >
            {page}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesPanel;
