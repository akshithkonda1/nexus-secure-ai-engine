import React from "react";

const ListsPanel: React.FC = () => {
  return (
    <div className="space-y-3 text-white">
      <h2 className="text-2xl font-semibold">Lists</h2>
      <p className="text-slate-200/80">
        Organize your workstreams with flexible lists. Add tasks, group items, and keep everything within reach.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4">Inbox</div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4">Active Projects</div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4">Ideas</div>
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg p-4">Archive</div>
      </div>
    </div>
  );
};

export default ListsPanel;
