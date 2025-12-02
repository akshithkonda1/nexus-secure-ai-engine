import React, { useMemo, useState } from "react";
import { CalendarEvent } from "@/types/workspace";
import { Calendar, Clock, Notebook } from "lucide-react";

interface CalendarPanelProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const VIEW_MODES = ["Day", "Week", "Month"] as const;
type ViewMode = (typeof VIEW_MODES)[number];

const CalendarPanel: React.FC<CalendarPanelProps> = ({ events, selectedDate, onSelectDate }) => {
  const [mode, setMode] = useState<ViewMode>("Week");

  const filtered = useMemo(() => {
    if (mode === "Month") return events;
    if (mode === "Week") {
      const start = new Date(selectedDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return events.filter((evt) => {
        const date = new Date(evt.date);
        return date >= start && date <= end;
      });
    }
    return events.filter((evt) => evt.date === selectedDate.toISOString().slice(0, 10));
  }, [events, mode, selectedDate]);

  return (
    <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
          <Calendar className="h-4 w-4" /> Calendar Panel
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/10 p-1">
          {VIEW_MODES.map((view) => (
            <button
              key={view}
              onClick={() => setMode(view)}
              className={`rounded-full px-3 py-1 text-sm transition ${mode === view ? "bg-white/20" : "text-white/70"}`}
            >
              {view} View
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((evt) => (
          <div key={evt.title} className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-white/90">
              {evt.title}
              <span className="text-xs uppercase text-white/60">{evt.type}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-white/70">
              <Clock className="h-4 w-4" />
              {new Date(evt.date).toDateString()}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white/80">
          <Notebook className="h-4 w-4" /> Notes for {selectedDate.toDateString()}
        </div>
        <textarea
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 p-3 text-sm text-white/80 focus:outline-none"
          placeholder="Add context or agenda for this day"
          onChange={(e) =>
            window.dispatchEvent(new CustomEvent("toron-signal", { detail: { calendarNotes: e.target.value } }))
          }
        />
        <div className="mt-3 text-xs text-white/60">Day view highlights sync with Toron when edited.</div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-wide text-white/60">
        <span className="rounded-full bg-red-500/20 px-3 py-1 text-red-100">Urgent</span>
        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-100">Meetings</span>
        <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-yellow-100">Events</span>
        <span className="rounded-full bg-blue-500/20 px-3 py-1 text-blue-100">Multi-person</span>
      </div>
    </div>
  );
};

export default CalendarPanel;
