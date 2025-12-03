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

  const border = isDark ? "border-borderLight/10" : "border-borderLight/5";
  const surface = isDark ? "bg-bgElevated" : "bg-bgPrimary";
  const textPrimary = isDark ? "text-textMuted" : "text-textPrimary";
  const textSecondary = isDark ? "text-textMuted" : "text-textSecondary";

  return (
    <div className={`flex h-full flex-col gap-4 rounded-3xl border ${border} ${surface} p-6 shadow-xl`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-textPrimary dark:text-textMuted">
          <CalendarIcon className="h-4 w-4" /> Calendar Hub
        </div>
        <div className="flex items-center gap-2 text-sm text-textPrimary dark:text-textMuted">
          <button
            className={`rounded-full p-2 font-semibold ${
              isDark ? "bg-bgElevated text-textPrimary hover:bg-bgSecondary" : "bg-bgPrimary text-textPrimary hover:bg-bgPrimary"
            }`}
            onClick={() => changeDay(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-semibold text-textPrimary dark:text-textMuted">
            {selectedDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <button
            className={`rounded-full p-2 font-semibold ${
              isDark ? "bg-bgElevated text-textPrimary hover:bg-bgSecondary" : "bg-bgPrimary text-textPrimary hover:bg-bgPrimary"
            }`}
            onClick={() => changeDay(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {close && (
            <button
              onClick={close}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                isDark ? "bg-bgElevated text-textPrimary hover:bg-bgSecondary" : "bg-bgPrimary text-textPrimary hover:bg-bgPrimary"
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
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isDark ? "bg-bgElevated" : "bg-bgPrimary"}`}>
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
                isDark ? "bg-bgElevated text-textPrimary" : "bg-bgPrimary text-textPrimary"
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
