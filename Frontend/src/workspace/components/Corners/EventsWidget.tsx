import React from "react";
import { useEventsStore } from "../../state/eventsStore";
import { useModeStore } from "../../state/modeStore";

export const EventsWidget: React.FC = () => {
  const { events } = useEventsStore();
  const { mode } = useModeStore();

  const tilePanel =
    "relative rounded-3xl bg-tile bg-tileGradient border border-tileBorder shadow-tile px-6 py-5 before:absolute before:inset-0 before:rounded-3xl before:bg-tileInner before:content-[''] before:pointer-events-none transition-all duration-300 hover:shadow-tileStrong hover:border-tileBorderStrong";
  const innerTile = "rounded-xl bg-tileStrong border border-tileBorder px-4 py-3 shadow-tile";

  return (
    <div className={`${tilePanel} fade-in`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-textSecondary">Events</p>
          <p className="text-sm text-textMuted">History & activity log</p>
        </div>
        <span className="text-xs text-textSecondary">{mode === "advanced" ? "Advanced" : "Basic"}</span>
      </div>
      <div className="mt-3 space-y-2 text-sm text-textMuted">
        {events.length === 0 && <p className="text-textSecondary">No events yet.</p>}
        {events.map((event) => (
          <div key={event.id} className={innerTile}>
            <p>{event.description}</p>
            <p className="text-xs text-textSecondary">{new Date(event.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
      {mode === "advanced" && (
        <div className={`${innerTile} mt-3 text-xs text-textMuted`}>
          Auto-updates whenever Pages saves.
        </div>
      )}
    </div>
  );
};
