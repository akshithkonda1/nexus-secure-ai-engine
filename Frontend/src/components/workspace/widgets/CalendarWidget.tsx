import React from "react";

const CalendarWidget: React.FC = () => {
  const items = [
    { day: "Mon", focus: "Deep research", time: "10:00" },
    { day: "Tue", focus: "Design review", time: "14:30" },
    { day: "Wed", focus: "User testing", time: "16:00" },
    { day: "Thu", focus: "Content updates", time: "11:00" },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_90%,transparent)] p-6 shadow-lg shadow-black/5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Calendar</h3>
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Week View</span>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.day}
            className="rounded-xl border border-[var(--border-subtle)] bg-black/10 p-4 text-sm text-[var(--text-primary)]"
          >
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-[var(--text-secondary)]">
              <span>{item.day}</span>
              <span>{item.time}</span>
            </div>
            <p className="mt-2 text-sm font-semibold leading-tight">{item.focus}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWidget;
