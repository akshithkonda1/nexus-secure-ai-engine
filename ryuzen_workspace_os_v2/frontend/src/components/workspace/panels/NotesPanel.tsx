import React from "react";

const NotesPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-[var(--rz-text)]">
      <h2 className="text-2xl font-semibold text-[var(--rz-text)]">Notes</h2>
      <p className="text-[var(--rz-text)]">Capture quick thoughts and decisions.</p>
      <div className="space-y-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e121b] p-4 text-[var(--rz-text)]">
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e121b] p-3 text-sm text-[var(--rz-text)]">
          Meeting recap
        </div>
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e121b] p-3 text-sm text-[var(--rz-text)]">
          Research ideas
        </div>
        <div className="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#0e121b] p-3 text-sm text-[var(--rz-text)]">
          Implementation notes
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
