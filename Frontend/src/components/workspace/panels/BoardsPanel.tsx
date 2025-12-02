import React from 'react';

const BoardsPanel: React.FC = () => {
  return (
    <div className="space-y-4 text-white">
      <div>
        <h3 className="text-2xl font-semibold">Boards</h3>
        <p className="text-white/70">Kanban-style board editor placeholder.</p>
      </div>
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 min-h-[220px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/80">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">Ideas</div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">In Progress</div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">Complete</div>
        </div>
        <p className="mt-4 text-sm text-white/60">Drag and drop interactions will live here.</p>
      </div>
    </div>
  );
};

export default BoardsPanel;
