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
  const panelShell =
    "relative bg-glass backdrop-blur-2xl border border-glassBorder shadow-glass rounded-3xl px-6 py-5 transition-all duration-300 before:absolute before:inset-0 before:rounded-3xl before:bg-glassInner before:blur-xl before:pointer-events-none hover:bg-glassHeavy hover:border-glassBorderStrong hover:shadow-glassStrong hover:scale-[1.01]";

  const changeDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + delta);
    onSelectDate(next);
  };

  return (
    <div className={`flex h-full flex-col gap-4 ${panelShell}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-textPrimary">
          <CalendarIcon className="h-4 w-4" /> Calendar Hub
        </div>
        <div className="flex items-center gap-2 text-sm text-textPrimary">
          <button
            className="rounded-full border border-glassBorder p-2 font-semibold text-textPrimary transition hover:border-glassBorderStrong"
            onClick={() => changeDay(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold text-textPrimary">
            {selectedDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <button
            className="rounded-full border border-glassBorder p-2 font-semibold text-textPrimary transition hover:border-glassBorderStrong"
            onClick={() => changeDay(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {close && (
            <button
              onClick={close}
              className="rounded-full border border-glassBorder px-4 py-2 text-sm font-semibold text-textPrimary transition hover:border-glassBorderStrong"
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
            className={`flex items-center justify-between ${panelShell} px-4 py-3 shadow-none`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-glassBorder bg-glass">
                <span className={`h-3 w-3 rounded-full ${eventColors[evt.type]}`} />
              </div>
              <div>
                <p className="font-semibold text-textPrimary">{evt.title}</p>
                <p className="flex items-center gap-1 text-xs text-textMuted">
                  <Clock className="h-3 w-3" /> {evt.date}
                </p>
              </div>
            </div>
            <span
              className="rounded-full border border-glassBorder px-3 py-1 text-[11px] font-semibold uppercase text-textPrimary"
            >
              {evt.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarPanel;
