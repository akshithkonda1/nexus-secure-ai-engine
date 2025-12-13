import React, { useCallback, useState } from "react";
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
import { useTheme } from "../../state/theme";

const WorkspaceContent: React.FC = () => {
  const [mode, setMode] = useState<WorkspaceMode>(null);
  const { openWidget, currentWidget } = useWidgetManager();
  const { theme, toggleTheme } = useTheme();

  const toggleMode = useCallback((nextMode: WorkspaceMode) => {
    setMode((prev) => (prev === nextMode ? null : nextMode));
  }, []);

  return (
    <div style={{ background: "var(--bg-canvas)", color: "var(--text-primary)", padding: 20 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p style={{ margin: 0, color: "var(--text-secondary)" }}>Ryuzen Workspace OS</p>
            <h1 style={{ margin: 0, fontSize: 24 }}>Control Center</h1>
          </div>
          <button type="button" className="pill-button secondary" onClick={toggleTheme} aria-pressed={theme === "dark"}>
            Toggle {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            gap: 16,
            alignItems: "stretch",
          }}
        >
          <div style={{ gridColumn: "span 3" }}>
            <ListsWidget active={currentWidget === "lists"} onClick={() => openWidget("lists")} />
          </div>
          <div style={{ gridColumn: "span 6", gridRow: "span 2" }}>
            <WorkspaceCanvas mode={mode} />
          </div>
          <div style={{ gridColumn: "span 3" }}>
            <CalendarWidget active={currentWidget === "calendar"} onClick={() => openWidget("calendar")} />
          </div>
          <div style={{ gridColumn: "span 3" }}>
            <ConnectorsWidget active={currentWidget === "connectors"} onClick={() => openWidget("connectors")} />
          </div>
          <div style={{ gridColumn: "span 3", gridColumnStart: 10 }}>
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
