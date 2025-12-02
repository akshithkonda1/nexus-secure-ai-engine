import React from "react";
import { NotebookText, Sparkles } from "lucide-react";

const NotesPanel: React.FC = () => {
  return (
    <div className="fade-in scale-in mx-auto max-w-3xl rounded-[32px] border border-white/15 bg-white/5 p-8 text-white shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
          <NotebookText className="h-4 w-4" /> Notes
        </div>
        <button className="rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/80 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-white/20">
          Sync to Toron
        </button>
      </div>

      <p className="mt-3 text-sm text-white/70">Quick glass notes that stream into Toron when you summon them.</p>

      <div className="mt-6 space-y-3">
        {["Hyperspace brief", "Signal inventory", "Debate prep"].map((note) => (
          <div
            key={note}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/90 transition duration-200 ease-out hover:bg-white/10"
          >
            <div>
              <p className="text-base font-semibold text-white">{note}</p>
              <p className="text-sm text-white/60">Encrypted • Autosaves • Contextual</p>
            </div>
            <Sparkles className="h-4 w-4 text-white/70" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesPanel;
