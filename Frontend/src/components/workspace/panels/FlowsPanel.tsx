import React from 'react';

const FlowsPanel: React.FC = () => {
  return (
    <div className="space-y-4 text-white">
      <div>
        <h3 className="text-2xl font-semibold">Flows</h3>
        <p className="text-white/70">Automate steps with a visual flow builder.</p>
      </div>
      <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl p-6 min-h-[220px] flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">Trigger</span>
          <div className="flex-1 h-px bg-white/10" />
          <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">Action</span>
          <div className="flex-1 h-px bg-white/10" />
          <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/20">Review</span>
        </div>
        <p className="text-sm text-white/60">Flow nodes and automation logic will render here.</p>
      </div>
    </div>
  );
};

export default FlowsPanel;
