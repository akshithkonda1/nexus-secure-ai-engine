import React from "react";

const Workspace: React.FC = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[color-mix(in_srgb,var(--panel-elevated)_85%,transparent)] p-12 text-center text-3xl font-bold text-[var(--text-primary)] shadow-lg">
      Workspace Loaded
    </div>
  );
};

export default Workspace;
