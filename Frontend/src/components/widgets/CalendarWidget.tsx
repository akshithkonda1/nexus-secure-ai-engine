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
      className="ryuzen-card relative bg-[var(--bg-widget)] p-4 text-[var(--text-primary)]"
      onClick={() => onSelectDate(selectedDate)}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[20px] ring-1 ring-[var(--border-card)]" />
      <div className="mb-3 flex items-center justify-between text-sm text-[var(--text-secondary)]">
        <div className="flex items-center gap-2 uppercase tracking-[0.2em]">
          <CalendarIcon className="h-4 w-4" /> Calendar
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] p-1 text-[var(--text-primary)] transition hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              changeMonth(-1);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-xs font-medium text-[var(--text-secondary)]">
            {selectedDate.toLocaleString("default", { month: "long" })} {year}
          </div>
          <button
            className="rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] p-1 text-[var(--text-primary)] transition hover:opacity-80"
            onClick={(e) => {
              e.stopPropagation();
              changeMonth(1);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-[var(--text-secondary)]">
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
              className={`relative flex h-10 flex-col items-center justify-center rounded-2xl border text-[var(--text-primary)] transition hover:border-[var(--border-card)] hover:bg-[var(--bg-widget)] ${
                isSelected
                  ? "border-[var(--border-card)] bg-[var(--bg-card)]"
                  : "border-[var(--border-card)] bg-[var(--bg-widget)]"
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
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[var(--text-secondary)]">
        {events.map((evt) => (
          <div
            key={evt.title}
            className="flex items-center gap-1 rounded-full border border-[var(--border-card)] bg-[var(--bg-card)] px-2 py-1"
          >
            <span className={`h-2 w-2 rounded-full ${COLORS[evt.type]}`} />
            <span>{evt.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;
