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
        return <div className="text-textPrimary/80">Single-day timeline with focus slots.</div>;
      case 'week':
        return <div className="text-textPrimary/80">Seven-day agenda view with rolling cards.</div>;
      case 'month':
        return <div className="text-textPrimary/80">Full 31-day month grid placeholder.</div>;
      case 'year':
        return <div className="text-textPrimary/80">Yearly overview spanning 365 days.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 text-textPrimary">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Calendar</h3>
          <p className="text-textPrimary/70">Switch views to see how your time expands.</p>
        </div>
        <div className="flex gap-2">
          {views.map((item) => (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              className={`px-3 py-2 rounded-xl border text-sm font-semibold transition-colors ${
                view === item.key
                  ? 'bg-bgPrimary/20 border-borderLight/30 text-textPrimary'
                  : 'bg-bgPrimary/10 border-borderLight/20 text-textPrimary/70 hover:bg-bgPrimary/15'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[220px] rounded-2xl border border-borderLight/10 bg-bgPrimary/5 backdrop-blur-xl p-6 flex items-center justify-center">
        {renderView()}
      </div>
    </div>
  );
};

export default CalendarPanel;
