import React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { CalendarEvent } from "@/types/workspace";

interface CalendarWidgetProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const COLORS: Record<CalendarEvent["type"], string> = {
  urgent: "bg-red-500",
  meeting: "bg-emerald-500",
  event: "bg-amber-400",
  multi: "bg-blue-500",
};

const surfaceClass =
  "relative rounded-3xl bg-white/85 dark:bg-neutral-900/85 border border-neutral-300/50 dark:border-neutral-700/50 shadow-[0_4px_20px_rgba(0,0,0,0.10)] backdrop-blur-xl p-6 z-10";

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events, selectedDate, onSelectDate }) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const end = new Date(year, month + 1, 0);
  const days = Array.from({ length: end.getDate() }, (_, i) => i + 1);

  return (
    <button
      type="button"
      onClick={() => onSelectDate(selectedDate)}
      className={`w-full text-left focus:outline-none ${surfaceClass}`}
    >
      <div className="flex items-center justify-between border-b border-neutral-300/60 pb-3 text-sm dark:border-neutral-700/60">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-textPrimary">
          <CalendarIcon className="h-4 w-4" /> Calendar
        </div>
        <div className="text-xs font-semibold text-textSecondary">
          {selectedDate.toLocaleString("default", { month: "long" })} {year}
        </div>
      </div>
      <div className="pt-3">
        <div className="grid grid-cols-7 gap-2 text-center text-xs text-textSecondary">
          {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
            <div key={d}>{d}</div>
          ))}
          {days.map((day) => {
            const matchingEvents = events.filter((evt) => evt.date === new Date(year, month, day).toISOString().slice(0, 10));
            return (
              <div
                key={day}
                className="relative flex h-10 flex-col items-center justify-center rounded-xl border border-neutral-300/50 bg-white/85 text-sm font-semibold text-textPrimary backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85"
              >
                <span>{day}</span>
                <div className="mt-1 flex gap-1">
                  {matchingEvents.slice(0, 3).map((evt) => (
                    <span key={evt.title} className={`h-1.5 w-1.5 rounded-full ${COLORS[evt.type]}`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 space-y-2 text-xs text-textPrimary">
          {events.map((evt) => (
            <div
              key={evt.title}
              className="flex items-center justify-between rounded-2xl border border-neutral-300/50 bg-white/85 px-3 py-2 backdrop-blur-xl dark:border-neutral-700/50 dark:bg-neutral-900/85"
            >
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${COLORS[evt.type]}`} />
                <span className="font-semibold text-textPrimary">{evt.title}</span>
              </div>
              <span className="text-textMuted">{evt.date}</span>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
};

export default CalendarWidget;
