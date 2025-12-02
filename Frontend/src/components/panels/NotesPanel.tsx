import React from "react";
import { StickyNote } from "lucide-react";

const NotesPanel: React.FC<{ close?: () => void }> = ({ close }) => (
  <div className="rounded-[32px] border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-6 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
    <div className="mb-3 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
      <span className="flex items-center gap-2"><StickyNote className="h-4 w-4" /> Notes</span>
      {close && (
        <button
          onClick={close}
          className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-1 text-[11px] uppercase tracking-wide text-[color-mix(in_oklab,var(--text)_70%,transparent)]"
        >
          Close
        </button>
      )}
    </div>
    <p className="text-sm text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">Capture scratchpad ideas and micro-notes.</p>
    <textarea
      className="mt-4 h-40 w-full rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-4 text-sm text-[var(--text)] placeholder:text-black/50 focus:outline-none dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)] dark:text-[var(--text)] dark:placeholder:text-white/50"
      placeholder="Stream of consciousness..."
      onChange={(e) => window.dispatchEvent(new CustomEvent("toron-signal", { detail: { notes: e.target.value } }))}
    />
  </div>
);

export default NotesPanel;
