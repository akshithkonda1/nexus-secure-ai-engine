import React from 'react';

import type { WorkspaceMode } from '../WorkspaceShell';

interface OSBarProps {
  activeMode: WorkspaceMode;
  onSelect: (mode: WorkspaceMode) => void;
}

const OSBar: React.FC<OSBarProps> = ({ activeMode, onSelect }) => {
  const leftActions: { label: string; mode: WorkspaceMode }[] = [
    { label: 'Pages', mode: 'pages' },
    { label: 'Notes', mode: 'notes' },
    { label: 'Boards', mode: 'boards' },
    { label: 'Flows', mode: 'flows' },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-3 rounded-3xl bg-bgPrimary/5 border border-borderLight/10 backdrop-blur-xl flex items-center justify-between shadow-[0_10px_50px_-25px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-3">
        {leftActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onSelect(action.mode)}
            className={`px-4 py-2 rounded-2xl border transition-colors text-sm font-semibold ${activeMode === action.mode ? 'bg-bgPrimary/20 border-borderLight/30 text-textPrimary' : 'bg-bgPrimary/10 border-borderLight/20 text-textPrimary/80 hover:bg-bgPrimary/15'}`}
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelect('toron')}
          className={`px-4 py-2 rounded-2xl border transition-colors text-sm font-semibold ${activeMode === 'toron' ? 'bg-bgPrimary/20 border-borderLight/30 text-textPrimary' : 'bg-bgPrimary/10 border-borderLight/20 text-textPrimary/80 hover:bg-bgPrimary/15'}`}
        >
          Analyze with Toron
        </button>
        <button className="h-10 w-10 rounded-2xl bg-bgPrimary/10 border border-borderLight/20 text-textPrimary/80 hover:bg-bgPrimary/15">🔔</button>
        <button className="h-10 w-10 rounded-2xl bg-bgPrimary/10 border border-borderLight/20 text-textPrimary/80 hover:bg-bgPrimary/15">👤</button>
      </div>
    </div>
  );
};

export default OSBar;
