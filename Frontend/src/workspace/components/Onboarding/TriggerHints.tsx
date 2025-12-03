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
  const hintTile = "rounded-xl bg-tileStrong border border-tileBorder px-4 py-3 text-textMuted shadow-tile";

  return (
    <div className="mt-4 space-y-2 text-sm text-textMuted">
      {tasksDetected && (
        <p className={`${hintTile} text-emerald-300 ring-1 ring-emerald-600/40`}>
          Tasks detected → Lists glow.
        </p>
      )}
      {datesDetected && (
        <p className={`${hintTile} text-sky-300 ring-1 ring-sky-600/40`}>
          Dates detected → Calendar glow.
        </p>
      )}
      {questionsDetected && (
        <p className={`${hintTile} text-amber-300 ring-1 ring-amber-600/40`}>
          Question found → Workspace Bell pulses.
        </p>
      )}
      {showCorners && clusters.length > 0 && (
        <p className={`${hintTile} ring-1 ring-tileBorder`}>
          Semantic clusters: {clusters.join(", ")}
        </p>
      )}
    </div>
  );
};
