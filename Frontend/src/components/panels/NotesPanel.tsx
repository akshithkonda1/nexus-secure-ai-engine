import React from "react";
import { StickyNote } from "lucide-react";

const surfaceClass =
  "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";

const NotesPanel: React.FC<{ close?: () => void }> = ({ close }) => (
  <div className={`${surfaceClass} flex flex-col gap-4`}>
    <div className="flex items-center justify-between text-sm uppercase tracking-[0.2em] text-textSecondary">
      <span className="flex items-center gap-2 text-textPrimary">
        <StickyNote className="h-4 w-4" /> Notes
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
    <p className="text-sm text-textMuted">Capture scratchpad ideas and micro-notes.</p>
    <textarea
      className="mt-2 h-40 w-full rounded-2xl border border-neutral-300/50 bg-white/85 px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted focus:border-neutral-400 focus:outline-none backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85 dark:focus:border-neutral-600"
      placeholder="Stream of consciousness..."
      onChange={(e) => window.dispatchEvent(new CustomEvent("toron-signal", { detail: { notes: e.target.value } }))}
    />
  </div>
);

export default NotesPanel;
