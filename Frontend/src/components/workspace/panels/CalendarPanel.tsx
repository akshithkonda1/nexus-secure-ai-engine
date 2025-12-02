import React, { useState } from 'react';

const views = [
  { key: 'day', label: '1-Day' },
  { key: 'week', label: '7-Day' },
  { key: 'month', label: '31-Day' },
  { key: 'year', label: '365-Day' },
] as const;

type ViewKey = (typeof views)[number]['key'];

const CalendarPanel: React.FC = () => {
  const [view, setView] = useState<ViewKey>('day');

  const renderView = () => {
    switch (view) {
      case 'day':
        return <div className="text-white/80">Single-day timeline with focus slots.</div>;
      case 'week':
        return <div className="text-white/80">Seven-day agenda view with rolling cards.</div>;
      case 'month':
        return <div className="text-white/80">Full 31-day month grid placeholder.</div>;
      case 'year':
        return <div className="text-white/80">Yearly overview spanning 365 days.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Calendar</h3>
          <p className="text-white/70">Switch views to see how your time expands.</p>
        </div>
        <div className="flex gap-2">
          {views.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                view === item.key
                  ? 'bg-white/20 border-white/30 text-white'
                  : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/15'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[220px] rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 flex items-center justify-center">
        {renderView()}
      </div>
    </div>
  );
};

export default CalendarPanel;
