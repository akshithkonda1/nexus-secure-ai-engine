import React from "react";

const PagesPanel: React.FC = () => {
  return (
    <div className="space-y-4 leading-relaxed text-neutral-800 dark:text-neutral-200">
      <h2 className="text-2xl font-semibold">Pages</h2>
      <p>Craft documents and blueprints for the workspace.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {["Overview", "Playbooks", "Architecture"].map((page) => (
          <div
            key={page}
            className="relative rounded-3xl border border-white/10 dark:border-neutral-700/20 p-6 md:p-8 leading-relaxed text-neutral-800 dark:text-neutral-200 bg-white/85 dark:bg-neutral-900/85 shadow-[0_4px_20px_rgba(0,0,0,0.15)] z-[10]"
          >
            <div className="absolute inset-0 rounded-3xl pointer-events-none backdrop-blur-xl" />
            {page}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesPanel;
