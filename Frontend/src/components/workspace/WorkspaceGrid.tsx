import React from "react";

import BottomBar from "@/components/workspace/bottom/BottomBar";
import CalendarWidget from "@/components/workspace/widgets/CalendarWidget";
import ConnectionsWidget from "@/components/workspace/widgets/ConnectionsWidget";
import NotesWidget from "@/components/workspace/widgets/NotesWidget";
import ToronWidget from "@/components/workspace/widgets/ToronWidget";

const WorkspaceGrid: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <div className="grid grid-cols-2 grid-rows-2 gap-8 h-full">
          <ConnectionsWidget />
          <ToronWidget />
          <NotesWidget />
          <CalendarWidget />
        </div>
        <BottomBar />
      </div>
    </div>
  );
};

export default WorkspaceGrid;
