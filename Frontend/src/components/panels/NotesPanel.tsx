import React from "react";
import { StickyNote } from "lucide-react";

const NotesPanel: React.FC = () => (
  <div className="rounded-[32px] border border-black/10 bg-black/5 p-6 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
    <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-black/70 dark:text-white/70">
      <StickyNote className="h-4 w-4" /> Notes
    </div>
    <p className="text-sm text-black/70 dark:text-white/70">Capture scratchpad ideas and micro-notes.</p>
    <textarea
      className="mt-4 h-40 w-full rounded-2xl border border-black/10 bg-black/5 p-4 text-sm text-black/80 placeholder:text-black/50 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:placeholder:text-white/50"
      placeholder="Stream of consciousness..."
      onChange={(e) => window.dispatchEvent(new CustomEvent("toron-signal", { detail: { notes: e.target.value } }))}
    />
  </div>
);

export default NotesPanel;
