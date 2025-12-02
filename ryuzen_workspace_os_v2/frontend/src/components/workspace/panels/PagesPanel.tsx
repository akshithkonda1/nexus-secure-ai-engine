import React from "react";

const PagesPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-white">
      <h2 className="text-2xl font-semibold">Pages</h2>
      <p className="text-slate-200/80">
        Craft documents and blueprints. This area will host collaborative pages for the Ryuzen workspace.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {["Overview", "Playbooks", "Architecture"].map((page) => (
          <div key={page} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4">
            {page}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesPanel;
