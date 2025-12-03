import React from 'react';

const FlowsPanel: React.FC = () => {
  return (
    <div className="space-y-4 text-textPrimary">
      <div>
        <h3 className="text-2xl font-semibold">Flows</h3>
        <p className="text-textPrimary/70">Automate steps with a visual flow builder.</p>
      </div>
      <div className="rounded-2xl bg-bgPrimary/5 border border-borderLight/10 backdrop-blur-xl p-6 min-h-[220px] flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="px-3 py-2 rounded-xl bg-bgPrimary/10 border border-borderLight/20">Trigger</span>
          <div className="flex-1 h-px bg-bgPrimary/10" />
          <span className="px-3 py-2 rounded-xl bg-bgPrimary/10 border border-borderLight/20">Action</span>
          <div className="flex-1 h-px bg-bgPrimary/10" />
          <span className="px-3 py-2 rounded-xl bg-bgPrimary/10 border border-borderLight/20">Review</span>
        </div>
        <p className="text-sm text-textPrimary/60">Flow nodes and automation logic will render here.</p>
      </div>
    </div>
  );
};

export default FlowsPanel;
