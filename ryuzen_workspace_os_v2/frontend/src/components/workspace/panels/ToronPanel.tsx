import React from "react";

const ToronPanel: React.FC = () => {
  return (
    <div className="space-y-4 leading-relaxed text-neutral-800 dark:text-neutral-200">
      <h2 className="text-2xl font-semibold">Analyze with Toron</h2>
      <p>Toron intelligence will synthesize workspace data for insights.</p>
      <div
        className="
          relative space-y-3 rounded-3xl
          bg-white/85 dark:bg-neutral-900/85
          border border-neutral-300/50 dark:border-neutral-700/50
          text-neutral-800 dark:text-neutral-200
          shadow-[0_4px_20px_rgba(0,0,0,0.10)]
          backdrop-blur-xl
          p-6 md:p-8 z-[10]
        "
      >
        <div className="absolute inset-0 pointer-events-none rounded-3xl backdrop-blur-xl" />
        <div className="relative text-sm leading-relaxed">• Summaries and highlights</div>
        <div className="relative text-sm leading-relaxed">• Signal exploration</div>
        <div className="relative text-sm leading-relaxed">• Recommendations</div>
      </div>
    </div>
  );
};

export default ToronPanel;
