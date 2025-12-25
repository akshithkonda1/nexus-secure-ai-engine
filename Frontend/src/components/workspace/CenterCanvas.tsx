import { forwardRef } from "react";
import { CanvasMode } from "./types";
import PagesMode from "./modes/PagesMode";
import NotesMode from "./modes/NotesMode";
import BoardsMode from "./modes/BoardsMode";
import FlowsMode from "./modes/FlowsMode";
import AnalyzeMode from "./analyze/AnalyzeMode";

export interface CenterCanvasProps {
  mode: CanvasMode;
  isCleared: boolean;
  className?: string;
}

const CenterCanvas = forwardRef<HTMLElement, CenterCanvasProps>(
  ({ mode, isCleared, className = "" }, ref) => {
    const renderMode = () => {
      if (isCleared) {
        return (
          <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
            Canvas cleared. Switch modes to start fresh.
          </div>
        );
      }

      switch (mode) {
        case "pages":
          return <PagesMode />;
        case "notes":
          return <NotesMode />;
        case "boards":
          return <BoardsMode />;
        case "flows":
          return <FlowsMode />;
        case "analyze":
          return <AnalyzeMode />;
        default:
          return (
            <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
              Select a mode to begin
            </div>
          );
      }
    };

    return (
      <section
        ref={ref}
        className={`flex h-full min-h-[600px] flex-col rounded-3xl border border-[var(--line-subtle)] bg-[var(--bg-surface)]/30 p-8 backdrop-blur-xl ${className}`}
      >
        {renderMode()}
      </section>
    );
  }
);

CenterCanvas.displayName = "CenterCanvas";

export default CenterCanvas;
