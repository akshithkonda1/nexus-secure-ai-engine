import React, { useCallback, useEffect, useState } from "react";
import WorkspaceCanvas, { type WorkspaceMode } from "./WorkspaceCanvas";
import ListsWidget from "./widgets/ListsWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import ConnectorsWidget from "./widgets/ConnectorsWidget";
import OSBar from "./osbar/OSBar";
import { WidgetManagerProvider, useWidgetManager } from "../../state/useWidgetManager";
import ListsWidgetModal from "./widgets/Lists/WidgetModal";
import CalendarWidgetModal from "./widgets/Calendar/WidgetModal";
import ConnectorsWidgetModal from "./widgets/Connectors/WidgetModal";
import TasksWidgetModal from "./widgets/Tasks/WidgetModal";
import TasksWidget from "./widgets/TasksWidget";

const WorkspaceContent: React.FC = () => {
  const [mode, setMode] = useState<WorkspaceMode>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { openWidget, currentWidget } = useWidgetManager();

  const toggleMode = useCallback((nextMode: WorkspaceMode) => {
    setMode((prev) => (prev === nextMode ? null : nextMode));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div
      className="min-h-screen px-6 py-8 leading-relaxed text-neutral-800 dark:text-neutral-200"
      style={{ background: "var(--rz-bg)", color: "var(--rz-text)" }}
    >
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[var(--rz-text)]">
              Ryuzen Workspace OS
            </p>
            <h1 className="text-2xl font-bold text-[var(--rz-text)]">
              Control Center
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
            className="relative px-4 py-2 rounded-full text-sm bg-white/85 dark:bg-neutral-900/85 border border-white/10 dark:border-neutral-700/20 shadow-[0_4px_20px_rgba(0,0,0,0.15)] text-neutral-800 dark:text-neutral-200 hover:scale-[1.01] transition-transform duration-300"
          >
            <span className="absolute inset-0 rounded-full pointer-events-none backdrop-blur-xl" />
            Toggle {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6 auto-rows-fr">
          <div className="col-span-3">
            <ListsWidget active={currentWidget === "lists"} onClick={() => openWidget("lists")} />
          </div>
          <div className="col-span-6 row-span-2">
            <WorkspaceCanvas mode={mode} />
          </div>
          <div className="col-span-3">
            <CalendarWidget active={currentWidget === "calendar"} onClick={() => openWidget("calendar")} />
          </div>
          <div className="col-span-3">
            <ConnectorsWidget active={currentWidget === "connectors"} onClick={() => openWidget("connectors")} />
          </div>
          <div className="col-span-3 col-start-10">
            <TasksWidget active={currentWidget === "tasks"} onClick={() => openWidget("tasks")} />
          </div>
        </div>

        <OSBar mode={mode} setMode={toggleMode} />
      </div>

      <ListsWidgetModal />
      <CalendarWidgetModal />
      <ConnectorsWidgetModal />
      <TasksWidgetModal />
    </div>
  );
};

const WorkspaceShell: React.FC = () => (
  <WidgetManagerProvider>
    <WorkspaceContent />
  </WidgetManagerProvider>
);

export default WorkspaceShell;
