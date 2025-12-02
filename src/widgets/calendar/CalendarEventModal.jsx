import React, { useEffect, useState } from "react";
import { eventTypeColors } from "../../utils/colors";

const CalendarEventModal = ({ open, event, date, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState(event?.title || "");
  const [time, setTime] = useState(event?.time || "");
  const [type, setType] = useState(event?.type || "task");
  const [notes, setNotes] = useState(event?.notes || "");

  useEffect(() => {
    setTitle(event?.title || "");
    setTime(event?.time || "");
    setType(event?.type || "task");
    setNotes(event?.notes || "");
  }, [event, open]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({ ...event, title, time, type, notes, date });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-[var(--glass-blur)]">
      <div className="w-full max-w-lg rounded-3xl border border-[var(--border-card)] bg-[var(--bg-card)] p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">Event</p>
            <h3 className="text-xl font-semibold text-[var(--text-primary)]">{event ? "Edit" : "Add"} Event</h3>
            <p className="text-sm text-[var(--text-secondary)]">{date}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-[var(--border-card)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:bg-white/10"
          >
            Close
          </button>
        </div>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-widget)] px-4 py-3 text-[var(--text-primary)] focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Time (optional)"
              className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-widget)] px-4 py-3 text-[var(--text-primary)] focus:outline-none"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="rounded-xl border border-[var(--border-card)] bg-[var(--bg-widget)] px-4 py-3 text-[var(--text-primary)] focus:outline-none"
            >
              {Object.keys(eventTypeColors).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes"
            className="h-24 w-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-widget)] px-4 py-3 text-[var(--text-primary)] focus:outline-none"
          />
        </div>

        <div className="mt-5 flex items-center justify-between">
          {event ? (
            <button
              onClick={() => onDelete(event.id)}
              className="rounded-xl border border-[var(--border-card)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/10"
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-xl border border-[var(--border-card)] px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-xl bg-[var(--btn-bg)] px-4 py-2 text-sm font-semibold text-[var(--btn-text)] shadow"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarEventModal;
