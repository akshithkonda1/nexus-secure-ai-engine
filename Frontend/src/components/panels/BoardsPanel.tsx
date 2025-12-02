import React from "react";
import { Kanban } from "lucide-react";

const BoardsPanel: React.FC = () => (
  <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-white shadow-[0_8px_32px_rgba(0,0,0,0.32)] backdrop-blur-3xl">
    <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
      <Kanban className="h-4 w-4" /> Boards
    </div>
    <p className="text-sm text-white/70">Visual swimlanes for delivery workstreams.</p>
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      {["Intent", "Build", "Validate"].map((lane) => (
        <div key={lane} className="rounded-2xl border border-white/10 bg-black/30 p-3">
          <div className="text-sm font-semibold text-white/90">{lane}</div>
          <p className="mt-1 text-xs text-white/60">Drop cards here to reprioritize.</p>
        </div>
      ))}
    </div>
  </div>
);

export default BoardsPanel;
