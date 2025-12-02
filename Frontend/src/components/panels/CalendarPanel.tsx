import React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { CalendarEvent } from "@/types/workspace";

interface CalendarPanelProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  close?: () => void;
}

const eventColors: Record<CalendarEvent["type"], string> = {
  urgent: "bg-red-500",
  meeting: "bg-emerald-500",
  event: "bg-amber-400",
  multi: "bg-blue-500",
};

const CalendarPanel: React.FC<CalendarPanelProps> = ({ events, selectedDate, onSelectDate, close }) => {
  const changeDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + delta);
    onSelectDate(next);
  };

  return (
    <div className="rounded-[32px] border border-[var(--border)] bg-[var(--glass)] p-6 text-[var(--text)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
          <CalendarIcon className="h-4 w-4" /> Calendar Panel
        </div>
        <div className="flex items-center gap-2 text-sm text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
          <button
            className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] p-1 transition hover:bg-[color-mix(in_oklab,var(--glass)_90%,transparent)]"
            onClick={() => changeDay(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold">
            {selectedDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <button
            className="rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] p-1 transition hover:bg-[color-mix(in_oklab,var(--glass)_90%,transparent)]"
            onClick={() => changeDay(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {close && (
            <button
              onClick={close}
              className="ml-2 rounded-full border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-3 py-1 text-xs uppercase tracking-wide text-[color-mix(in_oklab,var(--text)_70%,transparent)]"
            >
              Close
            </button>
          )}
        </div>
      </div>
      <div className="space-y-3">
        {events.map((evt) => (
          <div
            key={evt.title}
            className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[color-mix(in_oklab,var(--glass)_70%,transparent)] px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--glass)_60%,transparent)]">
                <span className={`h-3 w-3 rounded-full ${eventColors[evt.type]}`} />
              </div>
              <div>
                <p className="font-medium text-[var(--text)]">{evt.title}</p>
                <p className="flex items-center gap-1 text-xs text-[color-mix(in_oklab,var(--text)_65%,transparent)]">
                  <Clock className="h-3 w-3" /> {evt.date}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-[color-mix(in_oklab,var(--glass)_60%,transparent)] px-3 py-1 text-[11px] uppercase tracking-wide text-[color-mix(in_oklab,var(--text)_70%,transparent)]">
              {evt.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarPanel;
