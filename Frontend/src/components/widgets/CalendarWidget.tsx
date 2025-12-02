import React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
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

const CalendarWidget: React.FC<CalendarWidgetProps> = ({ events, selectedDate, onSelectDate }) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days = Array.from({ length: end.getDate() }, (_, i) => new Date(year, month, i + 1));

  const changeMonth = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    onSelectDate(next);
  };

  const indicator = (day: Date) => events.filter((evt) => evt.date === day.toISOString().slice(0, 10));

  return (
    <div
      className="relative rounded-[32px] border border-black/10 bg-black/5 p-4 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl transition hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      onClick={() => onSelectDate(selectedDate)}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-black/10 dark:ring-white/10" />
      <div className="mb-3 flex items-center justify-between text-sm text-black/70 dark:text-white/80">
        <div className="flex items-center gap-2 uppercase tracking-[0.2em]">
          <CalendarIcon className="h-4 w-4" /> Calendar
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-black/10 bg-black/10 p-1 text-black/80 transition hover:bg-black/20 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              changeMonth(-1);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-xs font-medium text-black/70 dark:text-white/70">
            {selectedDate.toLocaleString("default", { month: "long" })} {year}
          </div>
          <button
            className="rounded-full border border-black/10 bg-black/10 p-1 text-black/80 transition hover:bg-black/20 dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              changeMonth(1);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-black/60 dark:text-white/60">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d}>{d}</div>
        ))}
        {Array.from({ length: start.getDay() }).map((_, idx) => (
          <div key={`empty-${idx}`} />
        ))}
        {days.map((day) => {
          const dots = indicator(day);
          const isSelected = day.toDateString() === selectedDate.toDateString();
          return (
            <button
              key={day.toISOString()}
              onClick={(e) => {
                e.stopPropagation();
                onSelectDate(day);
              }}
              className={`relative flex h-10 flex-col items-center justify-center rounded-2xl border text-black/80 transition hover:border-black/30 hover:bg-black/10 dark:text-white/80 dark:hover:border-white/30 dark:hover:bg-white/10 ${
                isSelected
                  ? "border-black/40 bg-black/10 dark:border-white/60 dark:bg-white/15"
                  : "border-black/10 bg-black/5 dark:border-white/15 dark:bg-white/5"
              }`}
            >
              <span className="text-sm font-semibold">{day.getDate()}</span>
              <div className="mt-1 flex gap-1">
                {dots.map((evt) => (
                  <span key={evt.title} className={`h-1.5 w-1.5 rounded-full ${COLORS[evt.type]}`} />
                ))}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-black/70 dark:text-white/70">
        {events.map((evt) => (
          <div key={evt.title} className="flex items-center gap-1 rounded-full border border-black/10 bg-black/5 px-2 py-1 dark:border-white/10 dark:bg-white/5">
            <span className={`h-2 w-2 rounded-full ${COLORS[evt.type]}`} />
            <span>{evt.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;
