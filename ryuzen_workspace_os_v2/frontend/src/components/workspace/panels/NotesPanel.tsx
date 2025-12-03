import React from "react";

const NotesPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-[var(--rz-text)]">
      <h2 className="text-2xl font-semibold text-[var(--rz-text)]">Notes</h2>
      <p className="text-[var(--rz-text)]">Capture quick thoughts and decisions.</p>
      <div className="space-y-2 rounded-2xl border p-4 text-[var(--rz-text)]" style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface)" }}>
        <div
          className="rounded-xl border p-3 text-sm text-[var(--rz-text)]"
          style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
        >
          Meeting recap
        </div>
        <div
          className="rounded-xl border p-3 text-sm text-[var(--rz-text)]"
          style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
        >
          Research ideas
        </div>
        <div
          className="rounded-xl border p-3 text-sm text-[var(--rz-text)]"
          style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
        >
          Implementation notes
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
