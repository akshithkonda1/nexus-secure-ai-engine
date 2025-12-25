import { useState, useEffect } from "react";
import { CanvasMode } from "./types";
import CenterCanvas from "./CenterCanvas";
import BottomBar from "./BottomBar";
import ListsWidget from "./widgets/ListsWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import ConnectorsWidget from "./widgets/ConnectorsWidget";
import TasksWidget from "./widgets/TasksWidget";

export interface WorkspaceSurfaceProps {
  mode: CanvasMode;
  onModeChange: (mode: CanvasMode) => void;
  isCleared: boolean;
  onHome: () => void;
}

export default function WorkspaceSurface({
  mode,
  onModeChange,
  isCleared,
  onHome,
}: WorkspaceSurfaceProps) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const query = window.matchMedia("(max-width: 639px)");
    
    const update = () => {
      console.log("Screen width check - isCompact:", query.matches);
      setIsCompact(query.matches);
    };
    
    update();
    query.addEventListener("change", update);
    
    return () => query.removeEventListener("change", update);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[var(--bg-app)]">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--bg-surface)/10_0%,_transparent_50%),_radial-gradient(ellipse_at_bottom,_var(--bg-elev)/5_0%,_transparent_50%)]" />

      {/* Main content area */}
      <div className="relative z-10 flex w-full flex-col gap-12 px-4 pb-28 pt-14">
        <div className="flex w-full gap-6">
          {/* Left sidebar - Widgets (always visible unless mobile) */}
          {!isCompact && (
            <aside className="flex w-80 shrink-0 flex-col gap-4">
              <ListsWidget className="w-full" />
              <ConnectorsWidget className="w-full" />
            </aside>
          )}

          {/* Center - Focus Canvas */}
          <main className="flex-1">
            <CenterCanvas
              mode={mode}
              isCleared={isCleared}
              className="w-full"
            />
          </main>

          {/* Right sidebar - Widgets (always visible unless mobile) */}
          {!isCompact && (
            <aside className="flex w-80 shrink-0 flex-col gap-4">
              <CalendarWidget className="w-full" />
              <TasksWidget className="w-full" />
            </aside>
          )}
        </div>
      </div>

      {/* Bottom navigation bar */}
      <BottomBar
        mode={mode}
        onChange={onModeChange}
        onHome={onHome}
      />
    </div>
  );
}
