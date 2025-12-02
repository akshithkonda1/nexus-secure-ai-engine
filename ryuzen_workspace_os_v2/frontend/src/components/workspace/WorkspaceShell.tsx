import React, { useCallback, useState } from "react";
import WorkspaceCanvas from "./WorkspaceCanvas";
import WorkspacePopup from "./WorkspacePopup";
import ListsWidget from "./widgets/ListsWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import ConnectorsWidget from "./widgets/ConnectorsWidget";
import OSBar from "./osbar/OSBar";

export type WorkspaceMode =
  | "lists"
  | "calendar"
  | "connectors"
  | "tasks"
  | "pages"
  | "notes"
  | "boards"
  | "flows"
  | "toron"
  | null;

const WorkspaceShell: React.FC = () => {
  const [mode, setMode] = useState<WorkspaceMode>(null);

  const toggleMode = useCallback((nextMode: WorkspaceMode) => {
    setMode((prev) => (prev === nextMode ? null : nextMode));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white px-6 py-8">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <ListsWidget active={mode === "lists"} onClick={() => toggleMode("lists")} />
          <div className="flex-1 flex justify-center">
            <CalendarWidget active={mode === "calendar"} onClick={() => toggleMode("calendar")} />
          </div>
          <ConnectorsWidget active={mode === "connectors"} onClick={() => toggleMode("connectors")} />
        </div>

        <WorkspaceCanvas mode={mode} onOpenTasks={() => toggleMode("tasks")}>
          <WorkspacePopup mode={mode} onClose={() => setMode(null)} />
        </WorkspaceCanvas>

        <OSBar mode={mode} setMode={toggleMode} />
      </div>
    </div>
  );
};

export default WorkspaceShell;
