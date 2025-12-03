import React from "react";
import { BookOpen, Pen } from "lucide-react";

const glassPanelClass =
  "relative bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-3xl px-6 py-5 transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-glassInner before:blur-xl before:pointer-events-none hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong hover:scale-[1.01]";

const PagesPanel: React.FC<{ close?: () => void }> = ({ close }) => {
  return (
    <div className={`${glassPanelClass} flex flex-col gap-4`}>
      <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-textSecondary">
        <span className="flex items-center gap-2 text-textPrimary">
          <BookOpen className="h-4 w-4" /> Pages
        </span>
        {close && (
          <button
            onClick={close}
            className="rounded-full border border-glassBorder px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-textPrimary transition hover:border-glassBorderStrong"
          >
            Close
          </button>
        )}
      </div>
      <p className="text-sm text-textMuted">Floating documents for quick creation and remix.</p>
      <div className="mt-2 space-y-2">
        {["Canvas overview", "Systems log", "Launch narrative"].map((page) => (
          <div key={page} className={`${glassPanelClass} flex items-center justify-between p-3 shadow-none`}>
            <span className="text-textPrimary">{page}</span>
            <button className="flex items-center gap-1 rounded-full border border-glassBorder px-3 py-1 text-[11px] uppercase text-textSecondary transition hover:border-glassBorderStrong">
              <Pen className="h-3 w-3" /> Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesPanel;
