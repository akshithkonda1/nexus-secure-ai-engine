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
    "relative rounded-3xl bg-tile bg-tileGradient border border-tileBorder shadow-tile px-6 py-5 before:absolute before:inset-0 before:rounded-3xl before:bg-tileInner before:content-[''] before:pointer-events-none transition-all duration-300 hover:shadow-tileStrong hover:border-tileBorderStrong";
  const innerTile = "rounded-xl bg-tileStrong border border-tileBorder px-4 py-3 shadow-tile";

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
                horizon === option.value ? "bg-emerald-600 text-textPrimary shadow-tile" : "bg-tileStrong text-textMuted shadow-tile"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 space-y-2">
        {entries.length === 0 && <p className="text-sm text-textSecondary">No calendar entries yet.</p>}
        {entries.map((entry) => (
          <div key={entry.id} className={`${innerTile} text-sm text-textMuted`}>
            <div className="font-semibold text-textPrimary">{entry.title}</div>
            <p className="text-xs text-textMuted">{new Date(entry.date).toDateString()}</p>
          </div>
        ))}
      </div>
      {mode === "advanced" && (
        <div className={`${innerTile} mt-3 text-xs text-textMuted`}>
          <p className="font-semibold text-textPrimary">Availability</p>
          <p className="mt-1">You have 2 free hours Friday.</p>
        </div>
      )}
    </div>
  );
};
