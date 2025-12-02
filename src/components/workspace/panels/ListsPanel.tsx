import React from "react";

const ListsPanel: React.FC = () => {
  return (
    <div className="space-y-4 text-white">
      <div className="text-2xl font-semibold tracking-tight">Lists</div>
      <p className="text-white/70">Manage your prioritized lists and organize key workflows.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {["Roadmap", "Sprint Items", "Backlog", "Research", "Signals", "Inbox"].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-lg hover:bg-white/10"
          >
            <div className="font-medium">{item}</div>
            <div className="text-sm text-white/60">Tap to dive into {item.toLowerCase()} details.</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ListsPanel;
