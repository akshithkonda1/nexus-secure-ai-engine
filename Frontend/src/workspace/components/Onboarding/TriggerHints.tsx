import React from "react";

export type TriggerHintsProps = {
  tasksDetected: boolean;
  datesDetected: boolean;
  questionsDetected: boolean;
  clusters: string[];
  showCorners: boolean;
};

export const TriggerHints: React.FC<TriggerHintsProps> = ({
  tasksDetected,
  datesDetected,
  questionsDetected,
  clusters,
  showCorners,
}) => {
  const hintTile =
    "relative overflow-hidden rounded-2xl bg-white/85 dark:bg-neutral-900/85 border border-white/10 dark:border-neutral-700/20 p-5 md:p-6 leading-relaxed text-neutral-700 dark:text-neutral-300 shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.01]";

  return (
    <div className="mt-4 space-y-3 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
      {tasksDetected && (
        <div className={`${hintTile} ring-1 ring-emerald-500/30`}>
          <div className="absolute inset-0 pointer-events-none rounded-2xl backdrop-blur-xl" />
          <p className="relative text-neutral-800 dark:text-neutral-100">Tasks detected → Lists glow.</p>
        </div>
      )}
      {datesDetected && (
        <div className={`${hintTile} ring-1 ring-sky-500/30`}>
          <div className="absolute inset-0 pointer-events-none rounded-2xl backdrop-blur-xl" />
          <p className="relative text-neutral-800 dark:text-neutral-100">Dates detected → Calendar glow.</p>
        </div>
      )}
      {questionsDetected && (
        <div className={`${hintTile} ring-1 ring-amber-500/30`}>
          <div className="absolute inset-0 pointer-events-none rounded-2xl backdrop-blur-xl" />
          <p className="relative text-neutral-800 dark:text-neutral-100">Question found → Workspace Bell pulses.</p>
        </div>
      )}
      {showCorners && clusters.length > 0 && (
        <div className={`${hintTile} ring-1 ring-white/10 dark:ring-neutral-700/20`}>
          <div className="absolute inset-0 pointer-events-none rounded-2xl backdrop-blur-xl" />
          <p className="relative text-neutral-800 dark:text-neutral-100">Semantic clusters: {clusters.join(", ")}</p>
        </div>
      )}
    </div>
  );
};
