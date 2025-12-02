import React from "react";
import { BookOpen, Pen } from "lucide-react";

const PagesPanel: React.FC = () => {
  return (
    <div className="rounded-[32px] border border-black/10 bg-black/5 p-6 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-black/70 dark:text-white/70">
        <BookOpen className="h-4 w-4" /> Pages
      </div>
      <p className="text-sm text-black/70 dark:text-white/70">Floating documents for quick creation and remix.</p>
      <div className="mt-4 space-y-2">
        {["Canvas overview", "Systems log", "Launch narrative"].map((page) => (
          <div key={page} className="flex items-center justify-between rounded-2xl border border-black/10 bg-black/5 px-3 py-2 dark:border-white/10 dark:bg-white/5">
            <span className="text-black/80 dark:text-white/80">{page}</span>
            <button className="flex items-center gap-1 rounded-full bg-black/10 px-3 py-1 text-[11px] uppercase text-black/70 transition hover:bg-black/20 dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20">
              <Pen className="h-3 w-3" /> Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesPanel;
