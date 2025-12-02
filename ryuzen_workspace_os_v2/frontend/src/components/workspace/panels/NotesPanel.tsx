import React from "react";

const NotesPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-white">
      <h2 className="text-2xl font-semibold">Notes</h2>
      <p className="text-slate-200/80">
        Capture quick thoughts and decisions. A lightweight scratchpad ready for future enhancements.
      </p>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4 space-y-2">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200/90">Meeting recap</div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200/90">Research ideas</div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200/90">Implementation notes</div>
      </div>
    </div>
  );
};

export default NotesPanel;
