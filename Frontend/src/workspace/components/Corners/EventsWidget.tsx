import React from "react";
import { useEventsStore } from "../../state/eventsStore";
import { useModeStore } from "../../state/modeStore";

export const EventsWidget: React.FC = () => {
  const { events } = useEventsStore();
  const { mode } = useModeStore();

  return (
    <div className="fade-in rounded-2xl border border-borderStrong bg-bgElevated/70 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-textMuted">Events</p>
          <p className="text-sm text-textMuted">History & activity log</p>
        </div>
        <span className="text-xs text-textSecondary">{mode === "advanced" ? "Advanced" : "Basic"}</span>
      </div>
      <div className="mt-3 space-y-2 text-sm text-textMuted">
        {events.length === 0 && <p className="text-textSecondary">No events yet.</p>}
        {events.map((event) => (
          <div key={event.id} className="rounded-lg bg-bgElevated/60 p-3">
            <p>{event.description}</p>
            <p className="text-xs text-textSecondary">{new Date(event.timestamp).toLocaleString()}</p>
          </div>
        ))}
      </div>
      {mode === "advanced" && (
        <div className="mt-3 rounded-xl bg-bgElevated/50 p-3 text-xs text-textMuted">
          Auto-updates whenever Pages saves.
        </div>
      )}
    </div>
  );
};
