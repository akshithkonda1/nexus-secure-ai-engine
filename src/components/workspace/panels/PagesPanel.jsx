import React from "react";

const PagesPanel = () => {
  const pages = ["Overview", "Research", "Launch", "Performance"];
  return (
    <div className="space-y-4 text-[var(--text-primary)]">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Workspace Canvas</p>
        <h2 className="text-2xl font-semibold">Pages</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {pages.map((page) => (
          <div
            key={page}
            className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-4 backdrop-blur-[var(--glass-blur)] hover:bg-white/5"
          >
            <div className="font-medium">{page}</div>
            <div className="text-sm text-[var(--text-secondary)]">Structured workspace page.</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesPanel;
