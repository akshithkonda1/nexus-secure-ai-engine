import { useEffect, useState } from "react";

import { testingApi } from "@/services/testingApi";
import type { WarRoomEvent } from "@/types/testing";

export default function WarRoom() {
  const [events, setEvents] = useState<WarRoomEvent[]>([]);
  const [note, setNote] = useState("");

  const loadEvents = () => testingApi.warRoom().then((data) => setEvents(data as WarRoomEvent[]));

  useEffect(() => {
    loadEvents();
  }, []);

  const quarantine = async () => {
    await testingApi.quarantineTelemetry(note || "Manual intervention", ["war-room"]);
    setNote("");
    loadEvents();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">War-room console</h1>
        <button
          type="button"
          onClick={loadEvents}
          className="rounded-lg border border-[var(--border-soft)] px-3 py-2"
        >
          Refresh
        </button>
      </div>
      <section className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-elevated)_80%,transparent)] p-4">
        <h2 className="text-xl font-semibold">Log event</h2>
        <div className="mt-2 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Describe action"
            className="w-full rounded-lg border border-[var(--border-soft)] bg-[var(--panel-strong)] px-3 py-2"
          />
          <button
            type="button"
            onClick={quarantine}
            className="rounded-lg bg-[var(--accent-primary)] px-3 py-2 font-semibold text-black shadow"
          >
            Trigger quarantine
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border-soft)] bg-[color-mix(in_srgb,var(--panel-strong)_85%,transparent)] p-4">
        <h2 className="text-xl font-semibold">Events</h2>
        <div className="mt-3 space-y-2 text-sm">
          {events.map((event, idx) => (
            <article key={`${event.created_at}-${idx}`} className="rounded-lg border border-[var(--border-soft)] bg-[var(--panel-elevated)] px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">{event.severity.toUpperCase()}</span>
                <span className="text-[var(--text-secondary)]">{event.created_at}</span>
              </div>
              <p className="text-[var(--text-primary)]">{event.message}</p>
              <p className="text-[var(--text-secondary)]">Action: {event.action}</p>
            </article>
          ))}
          {events.length === 0 && <p className="text-[var(--text-secondary)]">No events yet.</p>}
        </div>
      </section>
    </div>
  );
}
