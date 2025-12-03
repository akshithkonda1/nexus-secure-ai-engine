import React from 'react';
import type { WorkspaceMode } from './WorkspaceShell';

interface WorkspaceCanvasProps {
  mode: WorkspaceMode;
}

const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ mode }) => {
  return (
    <div className="relative flex-1 rounded-3xl bg-bgPrimary/5 border border-borderLight/10 backdrop-blur-xl overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/10 pointer-events-none" />
      <div className="relative h-full flex items-center justify-center p-10 text-center">
        {mode ? (
          <div className="text-textPrimary/70 text-lg">{`Focused on ${mode} workspace`}</div>
        ) : (
          <div className="space-y-3 max-w-xl">
            <div className="text-2xl font-semibold text-textPrimary">Ryuzen Workspace Canvas</div>
            <p className="text-textPrimary/70 text-base">
              Select a widget above or a tool below to open a floating panel. The canvas is glassmorphic and
              ready for your workflows.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceCanvas;
