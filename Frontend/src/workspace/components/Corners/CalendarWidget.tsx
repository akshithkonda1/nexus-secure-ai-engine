import React from "react";
import { useCalendarStore } from "../../state/calendarStore";
import { useModeStore } from "../../state/modeStore";

const horizons: Array<{ label: string; value: 1 | 7 | 30 | 365 }> = [
  { label: "1d", value: 1 },
  { label: "7d", value: 7 },
  { label: "30d", value: 30 },
  { label: "365d", value: 365 },
];

export const CalendarWidget: React.FC = () => {
  const { entries, horizon, setHorizon } = useCalendarStore();
  const { mode } = useModeStore();

  const tilePanel =
    "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl px-6 py-5 transition-all duration-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)]";
  const innerTile = "rounded-xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 px-4 py-3 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl";

  return (
    <div className={`${tilePanel} fade-in`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">Calendar</p>
          <p className="text-sm text-textMuted">Availability + time horizons</p>
        </div>
        <div className="flex gap-1">
          {horizons.map((option) => (
            <button
              key={option.value}
              onClick={() => setHorizon(option.value)}
              className={`rounded-full px-2 py-1 text-xs ${
                horizon === option.value
                  ? "bg-emerald-600 text-neutral-50 shadow-[0_4px_20px_rgba(0,0,0,0.15)]"
                  : "bg-white/85 dark:bg-neutral-900/85 text-neutral-800 dark:text-neutral-200 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {entries.length === 0 && <p className="text-sm text-neutral-700 dark:text-neutral-300">No calendar entries yet.</p>}
        {entries.map((entry) => (
          <div key={entry.id} className={`${innerTile} text-sm`}>
            <div className="font-semibold text-neutral-800 dark:text-neutral-100">{entry.title}</div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300">{new Date(entry.date).toDateString()}</p>
          </div>
        ))}
      </div>
      {mode === "advanced" && (
        <div className={`${innerTile} mt-3 text-xs`}>
          <p className="font-semibold text-neutral-800 dark:text-neutral-100">Availability</p>
          <p className="mt-1">You have 2 free hours Friday.</p>
        </div>
      )}
    </div>
  );
};
