import React from "react";
import { BookOpen, Pen } from "lucide-react";

const PagesPanel: React.FC<{ close?: () => void }> = ({ close }) => {
  return (
    <div className="rounded-[32px] border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-6 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
        <span className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Pages</span>
        {close && (
          <button
            onClick={close}
            className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-1 text-[11px] uppercase tracking-wide text-[color-mix(in_oklab,var(--text)_70%,transparent)]"
          >
            Close
          </button>
        )}
      </div>
      <p className="text-sm text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">Floating documents for quick creation and remix.</p>
      <div className="mt-4 space-y-2">
        {["Canvas overview", "Systems log", "Launch narrative"].map((page) => (
          <div key={page} className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-2 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
            <span className="text-[var(--text)] dark:text-[var(--text)]">{page}</span>
            <button className="flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-3 py-1 text-[11px] uppercase text-[color-mix(in_oklab,var(--text)_70%,transparent)] transition hover:bg-[color-mix(in_oklab,var(--glass)_85%,transparent)] dark:bg-[var(--glass)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
              <Pen className="h-3 w-3" /> Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesPanel;
