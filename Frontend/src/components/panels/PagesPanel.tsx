import React from "react";
import { BookOpen, Pen } from "lucide-react";

const surfaceClass =
  "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";

const PagesPanel: React.FC<{ close?: () => void }> = ({ close }) => {
  return (
    <div className={`${surfaceClass} flex flex-col gap-4`}>
      <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-textSecondary">
        <span className="flex items-center gap-2 text-textPrimary">
          <BookOpen className="h-4 w-4" /> Pages
        </span>
        {close && (
          <button
            onClick={close}
            className="rounded-full border border-neutral-300/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-textPrimary transition hover:border-neutral-400 dark:border-neutral-700/50 dark:hover:border-neutral-600"
          >
            Close
          </button>
        )}
      </div>
      <p className="text-sm text-textMuted">Floating documents for quick creation and remix.</p>
      <div className="mt-2 space-y-2">
        {["Canvas overview", "Systems log", "Launch narrative"].map((page) => (
          <div key={page} className={`${surfaceClass} flex items-center justify-between p-3`}>
            <span className="text-textPrimary">{page}</span>
            <button className="flex items-center gap-1 rounded-full border border-neutral-300/50 px-3 py-1 text-[11px] uppercase text-textSecondary transition hover:border-neutral-400 dark:border-neutral-700/50 dark:hover:border-neutral-600">
              <Pen className="h-3 w-3" /> Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesPanel;
