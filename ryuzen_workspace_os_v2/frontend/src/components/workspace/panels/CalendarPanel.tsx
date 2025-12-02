import React from "react";

const CalendarPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-white">
      <h2 className="text-2xl font-semibold">Calendar</h2>
      <p className="text-slate-200/80">
        Plan schedules and align timelines. Drop-in placeholder for the upcoming calendar integration.
      </p>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 grid grid-cols-7 gap-2 text-center text-sm">
        {[...Array(28)].map((_, idx) => (
          <div key={idx} className="aspect-square rounded-xl border border-white/10 bg-white/5 flex items-center justify-center">
            {idx + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarPanel;
