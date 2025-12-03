import React from "react";
import PagesPanel from "./panels/PagesPanel";
import NotesPanel from "./panels/NotesPanel";
import BoardsPanel from "./panels/BoardsPanel";
import FlowsPanel from "./panels/FlowsPanel";
import ToronPanel from "./panels/ToronPanel";

export type WorkspaceMode = "pages" | "notes" | "boards" | "flows" | "toron" | null;

interface WorkspaceCanvasProps {
  mode: WorkspaceMode;
}

const WorkspaceCanvas: React.FC<WorkspaceCanvasProps> = ({ mode }) => {
  const renderPanel = () => {
    switch (mode) {
      case "pages":
        return <PagesPanel />;
      case "notes":
        return <NotesPanel />;
      case "boards":
        return <BoardsPanel />;
      case "flows":
        return <FlowsPanel />;
      case "toron":
        return <ToronPanel />;
      default:
        return (
          <div className="flex flex-col gap-2 text-center items-center justify-center h-full">
            <p className="text-lg font-semibold" style={{ color: "var(--rz-text-primary)" }}>
              Workspace Canvas
            </p>
            <p className="max-w-xl text-sm" style={{ color: "var(--rz-text-secondary)" }}>
              Select a workspace view from the OS bar to focus on pages, notes, boards, flows, or Toron analysis. Widgets open as
              fullscreen modals for clarity.
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className="relative w-full min-h-[60vh] p-8 overflow-hidden"
      style={{
        background: "var(--rz-bg-secondary)",
        color: "var(--rz-text-secondary)",
        borderRadius: "var(--rz-radius)",
        backdropFilter: "blur(30px)",
        border: `1px solid var(--rz-border)`,
        boxShadow: `0 10px 30px var(--rz-shadow)` ,
      }}
    >
      {renderPanel()}
    </div>
  );
};

export default WorkspaceCanvas;
