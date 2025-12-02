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
      className="relative rounded-[32px] border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] p-4 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl transition hover:scale-[1.02] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
      onClick={() => onSelectDate(selectedDate)}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-black/10 dark:ring-white/10" />
      <div className="mb-3 flex items-center justify-between text-sm text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[var(--text)]">
        <div className="flex items-center gap-2 uppercase tracking-[0.2em]">
          <CalendarIcon className="h-4 w-4" /> Calendar
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] p-1 text-[var(--text)] transition hover:bg-black/20 dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)] dark:hover:bg-[color-mix(in_oklab,var(--glass)_85%,transparent)]"
            onClick={(e) => {
              e.stopPropagation();
              changeMonth(-1);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-xs font-medium text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
            {selectedDate.toLocaleString("default", { month: "long" })} {year}
          </div>
          <button
            className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] p-1 text-[var(--text)] transition hover:bg-black/20 dark:border-[var(--border)] dark:bg-[var(--glass)] dark:text-[var(--text)] dark:hover:bg-[color-mix(in_oklab,var(--glass)_85%,transparent)]"
            onClick={(e) => {
              e.stopPropagation();
              changeMonth(1);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-[color-mix(in_oklab,var(--text)_60%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_60%,transparent)]">
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
              className={`relative flex h-10 flex-col items-center justify-center rounded-2xl border text-[var(--text)] transition hover:border-black/30 hover:bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] dark:text-[var(--text)] dark:hover:border-white/30 dark:hover:bg-[var(--glass)] ${
                isSelected
                  ? "border-black/40 bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] dark:border-white/60 dark:bg-[color-mix(in_oklab,var(--glass)_70%,transparent)]"
                  : "border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] dark:border-white/15 dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]"
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
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[color-mix(in_oklab,var(--text)_70%,transparent)] dark:text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
        {events.map((evt) => (
          <div key={evt.title} className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-2 py-1 dark:border-[var(--border)] dark:bg-[color-mix(in_oklab,var(--glass)_55%,transparent)]">
            <span className={`h-2 w-2 rounded-full ${COLORS[evt.type]}`} />
            <span>{evt.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;
