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
    <div className="w-full max-w-5xl mx-auto px-6 py-3 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-between shadow-[0_10px_50px_-25px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-3">
        {leftActions.map((action) => (
          <button
            key={action.label}
            onClick={() => onSelect(action.mode)}
            className={`px-4 py-2 rounded-2xl border transition-colors text-sm font-semibold ${activeMode === action.mode ? 'bg-white/20 border-white/30 text-white' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15'}`}
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onSelect('toron')}
          className={`px-4 py-2 rounded-2xl border transition-colors text-sm font-semibold ${activeMode === 'toron' ? 'bg-white/20 border-white/30 text-white' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/15'}`}
        >
          Analyze with Toron
        </button>
        <button className="h-10 w-10 rounded-2xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/15">🔔</button>
        <button className="h-10 w-10 rounded-2xl bg-white/10 border border-white/20 text-white/80 hover:bg-white/15">👤</button>
      </div>
    </div>
  );
};

export default OSBar;
