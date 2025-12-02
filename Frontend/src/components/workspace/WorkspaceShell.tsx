import React, { useState } from 'react';
import WorkspaceCanvas from './WorkspaceCanvas';
import WorkspacePopup from './WorkspacePopup';
import ListsWidget from './widgets/ListsWidget';
import CalendarWidget from './widgets/CalendarWidget';
import ConnectorsWidget from './widgets/ConnectorsWidget';
import OSBar from './osbar/OSBar';

type WorkspaceMode =
  | 'lists'
  | 'calendar'
  | 'connectors'
  | 'tasks'
  | 'pages'
  | 'notes'
  | 'boards'
  | 'flows'
  | 'toron'
  | null;

const WorkspaceShell: React.FC = () => {
  const [mode, setMode] = useState<WorkspaceMode>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-white flex flex-col px-6 py-8">
      <div className="flex items-center justify-between gap-4 max-w-5xl w-full mx-auto mb-6">
        <ListsWidget active={mode === 'lists'} onClick={() => setMode('lists')} />
        <CalendarWidget active={mode === 'calendar'} onClick={() => setMode('calendar')} />
        <ConnectorsWidget active={mode === 'connectors'} onClick={() => setMode('connectors')} />
      </div>

      <div className="relative flex-1 flex flex-col max-w-6xl w-full mx-auto">
        <WorkspaceCanvas mode={mode} />
        <WorkspacePopup mode={mode} onClose={() => setMode(null)} setMode={setMode} />
      </div>

      <div className="mt-8">
        <OSBar activeMode={mode} onSelect={setMode} />
      </div>
    </div>
  );
};

export type { WorkspaceMode };
export default WorkspaceShell;
