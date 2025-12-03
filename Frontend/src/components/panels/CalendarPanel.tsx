import React from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { CalendarEvent } from "@/types/workspace";
import { useTheme } from "@/theme/ThemeProvider";

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const changeDay = (delta: number) => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + delta);
    onSelectDate(next);
  };

  const border = isDark ? "border-white/10" : "border-black/5";
  const surface = isDark ? "bg-neutral-900" : "bg-white";
  const textPrimary = isDark ? "text-neutral-100" : "text-neutral-900";
  const textSecondary = isDark ? "text-neutral-300" : "text-neutral-700";

  return (
    <div className={`flex h-full flex-col gap-4 rounded-3xl border ${border} ${surface} p-6 shadow-xl`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-neutral-900 dark:text-neutral-100">
          <CalendarIcon className="h-4 w-4" /> Calendar Hub
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-900 dark:text-neutral-100">
          <button
            className={`rounded-full p-2 font-semibold ${
              isDark ? "bg-neutral-800 text-white hover:bg-neutral-700" : "bg-neutral-100 text-black hover:bg-neutral-200"
            }`}
            onClick={() => changeDay(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {selectedDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <button
            className={`rounded-full p-2 font-semibold ${
              isDark ? "bg-neutral-800 text-white hover:bg-neutral-700" : "bg-neutral-100 text-black hover:bg-neutral-200"
            }`}
            onClick={() => changeDay(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {close && (
            <button
              onClick={close}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                isDark ? "bg-neutral-800 text-white hover:bg-neutral-700" : "bg-neutral-100 text-black hover:bg-neutral-200"
              }`}
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
            className={`flex items-center justify-between rounded-2xl border ${border} px-4 py-3 shadow-sm ${surface}`}
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isDark ? "bg-neutral-800" : "bg-neutral-100"}`}>
                <span className={`h-3 w-3 rounded-full ${eventColors[evt.type]}`} />
              </div>
              <div>
                <p className={`font-semibold ${textPrimary}`}>{evt.title}</p>
                <p className={`flex items-center gap-1 text-xs ${textSecondary}`}>
                  <Clock className="h-3 w-3" /> {evt.date}
                </p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${
                isDark ? "bg-neutral-800 text-white" : "bg-neutral-100 text-black"
              }`}
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
