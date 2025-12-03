import React from "react";
import { StickyNote } from "lucide-react";

const glassPanelClass =
  "relative bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-3xl px-6 py-5 transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-glassInner before:blur-xl before:pointer-events-none hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong hover:scale-[1.01]";

const NotesPanel: React.FC<{ close?: () => void }> = ({ close }) => (
  <div className={`${glassPanelClass} flex flex-col gap-4`}>
    <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-textSecondary">
      <span className="flex items-center gap-2 text-textPrimary">
        <StickyNote className="h-4 w-4" /> Notes
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
    <p className="text-sm text-textMuted">Capture scratchpad ideas and micro-notes.</p>
    <textarea
      className="mt-2 h-40 w-full rounded-2xl border border-glassBorder bg-glass px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted focus:border-glassBorderStrong focus:outline-none"
      placeholder="Stream of consciousness..."
      onChange={(e) => window.dispatchEvent(new CustomEvent("toron-signal", { detail: { notes: e.target.value } }))}
    />
  </div>
);

export default NotesPanel;
