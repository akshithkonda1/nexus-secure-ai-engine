import React, { useCallback, useState } from "react";
import WorkspaceCanvas from "./WorkspaceCanvas";
import OSBar from "./osbar/OSBar";
import ListsWidget from "../../widgets/lists/ListsWidget";
import CalendarWidget from "../../widgets/calendar/CalendarWidget";
import ConnectorsWidget from "../../widgets/connectors/ConnectorsWidget";
import TasksWidget from "../../widgets/tasks/TasksWidget";
import ToronOverlay from "./ToronOverlay";

const canvasModes = ["pages", "notes", "boards", "flows"];

const WorkspaceShell = () => {
  const [canvasMode, setCanvasMode] = useState(null);
  const [toronOpen, setToronOpen] = useState(false);

  const handleSetMode = useCallback((next) => {
    if (next === "toron") {
      setToronOpen(true);
      return;
    }
    if (canvasModes.includes(next)) {
      setCanvasMode(next);
    }
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-black px-4 py-10">
      <div className="relative mx-auto max-w-6xl space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="min-h-[320px]">
            <ListsWidget />
          </div>
          <div className="min-h-[320px]">
            <CalendarWidget />
          </div>
          <div className="min-h-[320px]">
            <ConnectorsWidget />
          </div>
          <div className="min-h-[320px]">
            <TasksWidget />
          </div>
        </div>

        <WorkspaceCanvas mode={canvasMode} onClose={() => setCanvasMode(null)} />
      </div>

      <OSBar activeMode={canvasMode} onSelect={handleSetMode} />
      <ToronOverlay open={toronOpen} onClose={() => setToronOpen(false)} />
    </div>
  );
};

export default WorkspaceShell;
