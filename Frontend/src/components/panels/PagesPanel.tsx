import React from "react";
import { BookOpen, Pen } from "lucide-react";

const PagesPanel: React.FC = () => {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl">
      <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
        <BookOpen className="h-4 w-4" /> Pages
      </div>
      <p className="text-sm text-white/70">Floating documents for quick creation and remix.</p>
      <div className="mt-4 space-y-2">
        {["Canvas overview", "Systems log", "Launch narrative"].map((page) => (
          <div key={page} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2">
            <span>{page}</span>
            <button className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase text-white/70 transition hover:bg-white/20">
              <Pen className="h-3 w-3" /> Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesPanel;
