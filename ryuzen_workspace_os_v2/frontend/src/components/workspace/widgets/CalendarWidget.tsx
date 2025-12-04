import React from "react";

interface WidgetProps {
  active: boolean;
  onClick: () => void;
}

const CalendarWidget: React.FC<WidgetProps> = ({ active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative w-full text-left rounded-3xl
        bg-white/85 dark:bg-neutral-900/85
        border border-neutral-300/50 dark:border-neutral-700/50
        text-neutral-800 dark:text-neutral-200
        shadow-[0_4px_20px_rgba(0,0,0,0.10)]
        backdrop-blur-xl
        p-6 z-10 md:p-8
        hover:scale-[1.01] transition-transform duration-300
        ${active ? "ring-2 ring-black/10 dark:ring-white/10" : ""}
      `}
    >
      <div className="absolute inset-0 rounded-3xl pointer-events-none backdrop-blur-xl" />
      <div className="relative space-y-2 leading-relaxed">
        <p className="text-sm">Calendar</p>
        <p className="text-lg font-semibold">Schedule</p>
      </div>
    </button>
  );
};

export default CalendarWidget;
