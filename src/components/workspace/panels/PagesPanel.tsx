import React from "react";

const PagesPanel: React.FC = () => {
  const pages = ["Overview", "Research", "Launch", "Performance"];
  return (
    <div className="space-y-4 text-white">
      <div className="text-2xl font-semibold tracking-tight">Pages</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {pages.map((page) => (
          <div
            key={page}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg hover:bg-white/10"
          >
            <div className="font-medium">{page}</div>
            <div className="text-sm text-white/60">Structured workspace page.</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PagesPanel;
