import React, { useState, useCallback } from "react";
import WorkspaceCanvas from "./WorkspaceCanvas";
import ListsWidget from "./widgets/ListsWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import ConnectorsWidget from "./widgets/ConnectorsWidget";
import TasksWidget from "./widgets/TasksWidget";
import OSBar from "./osbar/OSBar";

type WorkspaceMode =
  | null
  | "lists"
  | "calendar"
  | "connectors"
  | "tasks"
  | "pages"
  | "notes"
  | "boards"
  | "flows"
  | "toron";

const WorkspaceShell: React.FC = () => {
  const [mode, setMode] = useState<WorkspaceMode>(null);

  const handleSetMode = useCallback((next: WorkspaceMode) => {
    setMode(next);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden px-4 py-10">
      <div className="relative mx-auto h-[80vh] max-w-6xl">
        <div className="absolute top-6 left-6">
          <ListsWidget active={mode === "lists"} onClick={() => handleSetMode("lists")} />
        </div>
        <div className="absolute top-6 right-6">
          <CalendarWidget
            active={mode === "calendar"}
            onClick={() => handleSetMode("calendar")}
          />
        </div>
        <div className="absolute bottom-32 left-6">
          <ConnectorsWidget
            active={mode === "connectors"}
            onClick={() => handleSetMode("connectors")}
          />
        </div>
        <div className="absolute bottom-32 right-6">
          <TasksWidget active={mode === "tasks"} onClick={() => handleSetMode("tasks")} />
        </div>

        <WorkspaceCanvas mode={mode} onClose={() => handleSetMode(null)} />
      </div>

      <OSBar activeMode={mode} onSelect={handleSetMode} />
    </div>
  );
};

export type { WorkspaceMode };
export default WorkspaceShell;
