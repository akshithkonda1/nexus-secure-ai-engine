import React from "react";
import { useEventsStore } from "../../state/eventsStore";
import { useModeStore } from "../../state/modeStore";

export const EventsWidget: React.FC = () => {
  const { events } = useEventsStore();
  const { mode } = useModeStore();

  const glassPanel =
    "relative bg-glass backdrop-blur-3xl border border-glassBorder shadow-glass rounded-3xl px-6 py-5 transition-all duration-300 hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong hover:scale-[1.015] before:absolute before:inset-0 before:rounded-3xl before:bg-glassInner before:blur-xl before:pointer-events-none";

  return (
    <div className={`${glassPanel} fade-in`}>
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
          <div key={event.id} className={`${glassPanel}`}>
            <p>{event.description}</p>
            <p className="text-xs text-textSecondary">{new Date(event.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
      {mode === "advanced" && (
        <div className={`${glassPanel} mt-3 text-xs text-textMuted`}>
          Auto-updates whenever Pages saves.
        </div>
      )}
    </div>
  );
};
