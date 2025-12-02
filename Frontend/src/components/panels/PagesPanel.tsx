import React from "react";
import { BookOpen, Pen } from "lucide-react";

const cardClass = "rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white/90";

const PagesPanel: React.FC = () => {
  return (
    <div className="fade-in scale-in mx-auto max-w-3xl rounded-[32px] border border-white/15 bg-white/5 p-8 text-white shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
          <BookOpen className="h-4 w-4" /> Pages
        </div>
        <button className="rounded-full bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-white/80 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-white/20">
          New Page
        </button>
      </div>

      <p className="mt-3 text-sm text-white/70">Floating documents ready for remixing inside the LiquidOS canvas.</p>

      <div className="mt-6 space-y-3">
        {["Canvas overview", "Systems log", "Launch narrative"].map((page) => (
          <div key={page} className={`${cardClass} flex items-center justify-between transition duration-200 ease-out hover:bg-white/10`}>
            <div>
              <p className="text-base font-semibold text-white">{page}</p>
              <p className="text-sm text-white/60">Live-synced snapshot · Glass node</p>
            </div>
            <button className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-wide text-white/80 transition-all duration-200 ease-out hover:scale-[1.02] hover:bg-white/20">
              <Pen className="h-3 w-3" /> Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesPanel;
