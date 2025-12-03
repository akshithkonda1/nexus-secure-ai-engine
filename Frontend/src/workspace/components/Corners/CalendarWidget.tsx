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

  return (
    <div className="fade-in rounded-2xl border border-borderStrong bg-bgElevated/70 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-textMuted">Calendar</p>
          <p className="text-sm text-textMuted">Availability + time horizons</p>
        </div>
        <div className="flex gap-1">
          {horizons.map((option) => (
            <button
              key={option.value}
              onClick={() => setHorizon(option.value)}
              className={`rounded-full px-2 py-1 text-xs ${
                horizon === option.value ? "bg-emerald-600 text-textPrimary" : "bg-bgElevated text-textMuted"
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
          <div key={entry.id} className="rounded-lg bg-bgElevated/60 p-3 text-sm text-textMuted">
            <div className="font-semibold">{entry.title}</div>
            <p className="text-xs text-textMuted">{new Date(entry.date).toDateString()}</p>
          </div>
        ))}
      </div>
      {mode === "advanced" && (
        <div className="mt-3 rounded-xl bg-bgElevated/50 p-3 text-xs text-textMuted">
          <p className="font-semibold text-textMuted">Availability</p>
          <p className="mt-1">You have 2 free hours Friday.</p>
        </div>
      )}
    </div>
  );
};
