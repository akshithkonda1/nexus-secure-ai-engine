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
  return (
    <div className="mt-4 space-y-2 text-sm text-neutral-300">
      {tasksDetected && (
        <p className="rounded-lg bg-neutral-900/60 px-3 py-2 text-emerald-300 shadow ring-1 ring-emerald-600/40">
          Tasks detected → Lists glow.
        </p>
      )}
      {datesDetected && (
        <p className="rounded-lg bg-neutral-900/60 px-3 py-2 text-sky-300 shadow ring-1 ring-sky-600/40">
          Dates detected → Calendar glow.
        </p>
      )}
      {questionsDetected && (
        <p className="rounded-lg bg-neutral-900/60 px-3 py-2 text-amber-300 shadow ring-1 ring-amber-600/40">
          Question found → Workspace Bell pulses.
        </p>
      )}
      {showCorners && clusters.length > 0 && (
        <p className="rounded-lg bg-neutral-900/60 px-3 py-2 text-neutral-200 shadow ring-1 ring-neutral-700">
          Semantic clusters: {clusters.join(", ")}
        </p>
      )}
    </div>
  );
};
