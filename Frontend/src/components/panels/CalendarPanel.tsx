import React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { CalendarEvent } from "@/types/workspace";

interface CalendarPanelProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const eventColors: Record<CalendarEvent["type"], string> = {
  urgent: "bg-red-500",
  meeting: "bg-emerald-500",
  event: "bg-amber-400",
  multi: "bg-blue-500",
};

const CalendarPanel: React.FC<CalendarPanelProps> = ({ events, selectedDate, onSelectDate }) => {
  const changeDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + delta);
    onSelectDate(next);
  };

  return (
    <div className="rounded-[32px] border border-black/10 bg-black/5 p-6 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-black/70 dark:text-white/70">
          <CalendarIcon className="h-4 w-4" /> Calendar Panel
        </div>
        <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
          <button
            className="rounded-full border border-black/10 bg-black/10 p-1 transition hover:bg-black/20 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
            onClick={() => changeDay(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold">
            {selectedDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <button
            className="rounded-full border border-black/10 bg-black/10 p-1 transition hover:bg-black/20 dark:border-white/10 dark:bg-white/10 dark:hover:bg-white/20"
            onClick={() => changeDay(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="space-y-3">
        {events.map((evt) => (
          <div
            key={evt.title}
            className="flex items-center justify-between rounded-2xl border border-black/10 bg-black/5 px-3 py-2 text-sm dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black/10 dark:bg-white/10">
                <span className={`h-3 w-3 rounded-full ${eventColors[evt.type]}`} />
              </div>
              <div>
                <p className="font-medium text-black dark:text-white">{evt.title}</p>
                <p className="flex items-center gap-1 text-xs text-black/60 dark:text-white/60">
                  <Clock className="h-3 w-3" /> {evt.date}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-black/10 px-3 py-1 text-[11px] uppercase tracking-wide text-black/70 dark:bg-white/10 dark:text-white/70">
              {evt.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarPanel;
