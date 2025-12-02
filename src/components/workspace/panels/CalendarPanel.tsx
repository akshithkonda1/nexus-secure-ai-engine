import React from "react";

const CalendarPanel: React.FC = () => {
  const events = [
    { time: "09:00", title: "Product sync", detail: "Workspace vision" },
    { time: "11:30", title: "Design review", detail: "Flows iteration" },
    { time: "14:00", title: "Customer call", detail: "Enterprise pilot" },
    { time: "16:00", title: "Deep work", detail: "Model evals" },
  ];

  return (
    <div className="space-y-4 text-white">
      <div className="text-2xl font-semibold tracking-tight">Calendar</div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg">
        <div className="text-sm uppercase tracking-[0.2em] text-white/60">Today</div>
        <div className="mt-3 space-y-2">
          {events.map((event) => (
            <div
              key={event.title}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2"
            >
              <div>
                <div className="text-sm text-white/60">{event.time}</div>
                <div className="font-medium">{event.title}</div>
              </div>
              <div className="text-sm text-white/60">{event.detail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarPanel;
