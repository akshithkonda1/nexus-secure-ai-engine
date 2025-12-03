import React from 'react';

const PagesPanel: React.FC = () => {
  return (
    <div className="space-y-4 text-textPrimary">
      <div>
        <h3 className="text-2xl font-semibold">Pages</h3>
        <p className="text-textPrimary/70">Full workspace document editor placeholder.</p>
      </div>
      <textarea
        className="w-full min-h-[240px] rounded-2xl bg-bgPrimary/5 border border-borderLight/10 backdrop-blur-xl p-4 text-textPrimary placeholder:text-textPrimary/40 focus:outline-none focus:ring-2 focus:ring-white/30"
        placeholder="Start drafting your page..."
      />
    </div>
  );
};

export default PagesPanel;
