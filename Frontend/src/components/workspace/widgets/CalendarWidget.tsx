import React from "react";

const CalendarWidget: React.FC = () => {
  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-semibold mb-3">Calendar</h2>
      <p className="text-sm text-white/80">See your upcoming schedule at a glance.</p>
    </div>
  );
};

export default CalendarWidget;
