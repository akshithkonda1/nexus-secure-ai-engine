import React, { useMemo, useState } from "react";

type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  tags: string[];
  syncStatus: "Synced" | "Pending" | "Syncing";
};

const initialEvents: CalendarEvent[] = [
  {
    id: "ev-1",
    title: "Workspace planning sync",
    date: "2024-07-01",
    time: "09:00",
    tags: ["sync", "team"],
    syncStatus: "Synced",
  },
  {
    id: "ev-2",
    title: "Connector launch review",
    date: "2024-07-02",
    time: "14:30",
    tags: ["connectors"],
    syncStatus: "Pending",
  },
];

const CalendarPanel: React.FC = () => {
  const [calendarName, setCalendarName] = useState("Schedule");
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [newEvent, setNewEvent] = useState<CalendarEvent>({
    id: "temp",
    title: "",
    date: "",
    time: "",
    tags: [],
    syncStatus: "Pending",
  });

  const upcoming = useMemo(() => [...events].sort((a, b) => a.date.localeCompare(b.date)), [events]);

  const updateEvent = (id: string, payload: Partial<CalendarEvent> & { tags?: string }) => {
    setEvents((current) =>
      current.map((event) =>
        event.id === id
          ? {
              ...event,
              ...payload,
              tags: payload.tags !== undefined ? payload.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : event.tags,
            }
          : event
      )
    );
  };

  const addEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date.trim()) return;
    setEvents((current) => [
      ...current,
      {
        ...newEvent,
        id: `event-${Date.now()}`,
        tags: newEvent.tags,
        syncStatus: newEvent.syncStatus,
      },
    ]);
    setNewEvent({ id: "temp", title: "", date: "", time: "", tags: [], syncStatus: "Pending" });
  };

  const deleteEvent = (id: string) => setEvents((current) => current.filter((event) => event.id !== id));

  const reorderEvent = (id: string, direction: -1 | 1) => {
    setEvents((current) => {
      const index = current.findIndex((event) => event.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  return (
    <div className="space-y-4 text-[var(--rz-text)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--rz-text)]">Calendar</h2>
          <p className="text-[var(--rz-text)]">Events live in a full-screen floating window for focus.</p>
        </div>
        <input
          value={calendarName}
          onChange={(event) => setCalendarName(event.target.value)}
          className="rounded-full border px-4 py-2 text-[var(--rz-text)]"
          style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
          aria-label="Rename calendar"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <input
          value={newEvent.title}
          onChange={(event) => setNewEvent((prev) => ({ ...prev, title: event.target.value }))}
          className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
          style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
          placeholder="Event title"
        />
        <input
          type="date"
          value={newEvent.date}
          onChange={(event) => setNewEvent((prev) => ({ ...prev, date: event.target.value }))}
          className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
          style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
        />
        <input
          type="time"
          value={newEvent.time}
          onChange={(event) => setNewEvent((prev) => ({ ...prev, time: event.target.value }))}
          className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
          style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
        />
        <input
          value={newEvent.tags.join(", ")}
          onChange={(event) =>
            setNewEvent((prev) => ({ ...prev, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) }))
          }
          className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
          style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
          placeholder="Tags"
        />
      </div>
      <div className="flex items-center gap-3">
        <select
          value={newEvent.syncStatus}
          onChange={(event) => setNewEvent((prev) => ({ ...prev, syncStatus: event.target.value as CalendarEvent["syncStatus"] }))}
          className="rounded-xl border px-3 py-2 text-[var(--rz-text)]"
          style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
        >
          <option value="Synced">Synced</option>
          <option value="Pending">Pending</option>
          <option value="Syncing">Syncing</option>
        </select>
        <button
          type="button"
          className="rounded-full px-4 py-2 text-[var(--rz-text)]"
          style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface-glass)" }}
          onClick={addEvent}
        >
          Add event
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {upcoming.map((event, index) => (
          <div
            key={event.id}
            className="space-y-2 rounded-2xl border p-4 text-[var(--rz-text)]"
            style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface)" }}
          >
            <div className="grid gap-2 md:grid-cols-2">
              <input
                value={event.title}
                onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
                style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
              />
              <input
                type="date"
                value={event.date}
                onChange={(e) => updateEvent(event.id, { date: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
                style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
              />
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <input
                type="time"
                value={event.time}
                onChange={(e) => updateEvent(event.id, { time: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
                style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
              />
              <input
                value={event.tags.join(", ")}
                onChange={(e) => updateEvent(event.id, { tags: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
                style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
              />
              <select
                value={event.syncStatus}
                onChange={(e) => updateEvent(event.id, { syncStatus: e.target.value as CalendarEvent["syncStatus"] })}
                className="w-full rounded-xl border px-3 py-2 text-[var(--rz-text)]"
                style={{ borderColor: "var(--rz-border)", background: "var(--rz-surface-glass)" }}
              >
                <option value="Synced">Synced</option>
                <option value="Pending">Pending</option>
                <option value="Syncing">Syncing</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[var(--rz-text)]">
              <span className="rounded-full border px-3 py-1 text-xs text-[var(--rz-text)]" style={{ borderColor: "var(--rz-border)" }}>
                {calendarName}
              </span>
              <span className="rounded-full border px-3 py-1 text-xs text-[var(--rz-text)]" style={{ borderColor: "var(--rz-border)" }}>
                {event.tags.length ? event.tags.join(", ") : "No tags"}
              </span>
              <span className="rounded-full border px-3 py-1 text-xs text-[var(--rz-text)]" style={{ borderColor: "var(--rz-border)" }}>
                {event.syncStatus}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full px-3 py-1 text-sm text-[var(--rz-text)]"
                style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface-glass)" }}
                onClick={() => reorderEvent(event.id, -1)}
              >
                Move up
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-sm text-[var(--rz-text)]"
                style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface-glass)" }}
                onClick={() => reorderEvent(event.id, 1)}
              >
                Move down
              </button>
              <button
                type="button"
                className="rounded-full px-3 py-1 text-sm text-[var(--rz-text)]"
                style={{ border: `1px solid var(--rz-border)`, background: "var(--rz-surface-glass)" }}
                onClick={() => deleteEvent(event.id)}
              >
                Delete
              </button>
              <span className="ml-auto text-xs text-[var(--rz-text)]">Event {index + 1} of {events.length}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarPanel;
