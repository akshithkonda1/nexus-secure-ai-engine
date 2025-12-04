import React from "react";

const NotesPanel: React.FC = () => {
  return (
    <div className="space-y-4 leading-relaxed text-neutral-800 dark:text-neutral-200">
      <h2 className="text-2xl font-semibold">Notes</h2>
      <p>Capture quick thoughts and decisions.</p>
      <div className="relative space-y-3 rounded-3xl border border-white/10 dark:border-neutral-700/20 bg-white/85 dark:bg-neutral-900/85 p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-[10]">
        <div className="absolute inset-0 rounded-3xl pointer-events-none backdrop-blur-xl" />
        <div className="relative rounded-xl border border-white/10 dark:border-neutral-700/20 bg-white/85 dark:bg-neutral-900/85 p-3 text-sm leading-relaxed">
          Meeting recap
        </div>
        <div className="relative rounded-xl border border-white/10 dark:border-neutral-700/20 bg-white/85 dark:bg-neutral-900/85 p-3 text-sm leading-relaxed">
          Research ideas
        </div>
        <div className="relative rounded-xl border border-white/10 dark:border-neutral-700/20 bg-white/85 dark:bg-neutral-900/85 p-3 text-sm leading-relaxed">
          Implementation notes
        </div>
      </div>
    </div>
  );
};

export default NotesPanel;
