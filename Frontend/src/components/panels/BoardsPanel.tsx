import React from "react";
import { Kanban, MoveRight } from "lucide-react";

const BoardsPanel: React.FC = () => (
  <div className="fade-in scale-in mx-auto max-w-3xl rounded-[32px] border border-white/15 bg-white/5 p-8 text-white shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70">
        <Kanban className="h-4 w-4" /> Boards
      </div>
      <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white/80">Live</div>
    </div>

    <p className="mt-3 text-sm text-white/70">Visual swimlanes for delivery workstreams and studio ops.</p>

    <div className="mt-6 grid gap-3 md:grid-cols-3">
      {["Intent", "Build", "Validate"].map((lane) => (
        <div key={lane} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/90 transition duration-200 ease-out hover:bg-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-white">{lane}</div>
            <MoveRight className="h-4 w-4 text-white/60" />
          </div>
          <p className="mt-2 text-xs text-white/60">Drop cards here to reprioritize.</p>
        </div>
      ))}
    </div>
  </div>
);

export default BoardsPanel;
