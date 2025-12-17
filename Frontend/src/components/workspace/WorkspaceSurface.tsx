import { useEffect, useMemo, useState } from "react";
import CenterCanvas from "./CenterCanvas";
import BottomBar from "./BottomBar";
import ListsWidget from "./widgets/ListsWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import ConnectorsWidget from "./widgets/ConnectorsWidget";
import TasksWidget from "./widgets/TasksWidget";
import { CanvasMode } from "./types";

export default function WorkspaceSurface({ mode, onModeChange }: { mode: CanvasMode; onModeChange: (mode: CanvasMode) => void }) {
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setIsCompact(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const widgets = useMemo(
    () => (
      <>
        <ListsWidget className="sm:min-h-[clamp(180px,20vh,260px)] sm:min-w-0 lg:[grid-area:lists] lg:min-h-0 lg:min-w-0" />
        <CalendarWidget className="sm:min-h-[clamp(180px,20vh,260px)] sm:min-w-0 lg:[grid-area:calendar] lg:min-h-0 lg:min-w-0" />
        <ConnectorsWidget className="sm:min-h-[clamp(180px,20vh,260px)] sm:min-w-0 lg:[grid-area:connectors] lg:min-h-0 lg:min-w-0" />
        <TasksWidget className="sm:min-h-[clamp(180px,20vh,260px)] sm:min-w-0 lg:[grid-area:tasks] lg:min-h-0 lg:min-w-0" />
      </>
    ),
    []
  );

  return (
    <div className="relative flex h-full w-full flex-col gap-4 rounded-[28px] bg-[var(--bg-app)]/60 p-3 pb-8 shadow-[var(--shadow-med)] ring-1 ring-[var(--line-subtle)] backdrop-blur-xl">
      <div className="relative flex-1 rounded-[24px] bg-[var(--bg-surface)]/60 p-2 ring-1 ring-[var(--line-subtle)]">
        <div
          className="relative flex h-full flex-col gap-4 rounded-2xl bg-[var(--bg-surface)]/80 p-3 sm:p-4"
        >
          <div
            className="flex h-full flex-col gap-4 lg:grid lg:[grid-template-areas:'lists_canvas_calendar''connectors_canvas_tasks'] lg:[grid-template-columns:clamp(260px,22vw,360px)_1fr_clamp(260px,22vw,360px)] lg:[grid-template-rows:clamp(180px,20vh,260px)_minmax(60vh,1fr)]"
          >
            <CenterCanvas mode={mode} className="order-1 [grid-area:canvas]" />

            {!isCompact && <div className="order-2 hidden gap-3 sm:grid sm:grid-cols-2 lg:contents">{widgets}</div>}

            {isCompact && (
              <div className="order-2 -mx-1 flex gap-3 overflow-x-auto pb-1 sm:hidden snap-x snap-mandatory">
                <ListsWidget className="min-w-[clamp(240px,70vw,320px)] snap-start" />
                <CalendarWidget className="min-w-[clamp(240px,70vw,320px)] snap-start" />
                <ConnectorsWidget className="min-w-[clamp(240px,70vw,320px)] snap-start" />
                <TasksWidget className="min-w-[clamp(240px,70vw,320px)] snap-start" />
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomBar mode={mode} onChange={onModeChange} />
    </div>
  );
}
