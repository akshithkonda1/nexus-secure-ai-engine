import React from "react";
import { Kanban } from "lucide-react";

const BoardsPanel: React.FC = () => (
  <div className="rounded-[32px] border border-black/10 bg-black/5 p-6 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
    <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-black/70 dark:text-white/70">
      <Kanban className="h-4 w-4" /> Boards
    </div>
    <p className="text-sm text-black/70 dark:text-white/70">Visual swimlanes for delivery workstreams.</p>
    <div className="mt-4 grid gap-3 md:grid-cols-3">
      {["Intent", "Build", "Validate"].map((lane) => (
        <div key={lane} className="rounded-2xl border border-black/10 bg-black/5 p-3 dark:border-white/10 dark:bg-white/5">
          <div className="text-sm font-semibold text-black dark:text-white">{lane}</div>
          <p className="mt-1 text-xs text-black/60 dark:text-white/60">Drop cards here to reprioritize.</p>
        </div>
      ))}
    </div>
  </div>
);

export default BoardsPanel;
