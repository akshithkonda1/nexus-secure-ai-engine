import React from "react";
import { StickyNote } from "lucide-react";

const NotesPanel: React.FC = () => (
  <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl">
    <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
      <StickyNote className="h-4 w-4" /> Notes
    </div>
    <p className="text-sm text-white/70">Capture scratchpad ideas and micro-notes.</p>
    <textarea
      className="mt-4 h-40 w-full rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80 focus:outline-none"
      placeholder="Stream of consciousness..."
      onChange={(e) => window.dispatchEvent(new CustomEvent("toron-signal", { detail: { notes: e.target.value } }))}
    />
  </div>
);

export default NotesPanel;
