import React from "react";

const notes = [
  "Summarize the latest customer feedback loops.",
  "Sketch navigation options for the workspace hub.",
  "Draft prompt templates for persona testing.",
];

const NotesWidget: React.FC = () => {
  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] p-6 shadow-lg shadow-black/5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Notes</h3>
        <button className="text-sm font-medium text-emerald-400 transition hover:text-emerald-300">New Note</button>
      </div>
      <div className="space-y-3 text-sm text-[var(--text-primary)]">
        {notes.map((note, index) => (
          <div
            key={note}
            className="rounded-xl border border-[var(--border-subtle)] bg-black/10 px-4 py-3 shadow-inner shadow-black/5"
          >
            <div className="mb-1 text-[var(--text-secondary)]">Snippet {index + 1}</div>
            <p className="leading-relaxed">{note}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesWidget;
