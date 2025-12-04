import React from "react";
import { useEventsStore } from "../../state/eventsStore";
import { useModeStore } from "../../state/modeStore";

export const EventsWidget: React.FC = () => {
  const { events } = useEventsStore();
  const { mode } = useModeStore();

  const tilePanel =
    "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.15)] backdrop-blur-xl px-6 py-5 transition-all duration-300 hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)]";
  const innerTile = "rounded-xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 px-4 py-3 text-neutral-800 dark:text-neutral-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl";

  return (
    <div className={`${tilePanel} fade-in`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">Events</p>
          <p className="text-sm text-textMuted">History & activity log</p>
        </div>
        <span className="text-xs text-textSecondary">{mode === "advanced" ? "Advanced" : "Basic"}</span>
      </div>
      <div className="mt-3 space-y-2 text-sm text-neutral-800 dark:text-neutral-200">
        {events.length === 0 && <p className="text-neutral-700 dark:text-neutral-300">No events yet.</p>}
        {events.map((event) => (
          <div key={event.id} className={innerTile}>
            <p className="text-neutral-800 dark:text-neutral-100">{event.description}</p>
            <p className="text-xs text-neutral-700 dark:text-neutral-300">{new Date(event.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
      {mode === "advanced" && (
        <div className={`${innerTile} mt-3 text-xs`}>
          Auto-updates whenever Pages saves.
        </div>
      )}
    </div>
  );
};
