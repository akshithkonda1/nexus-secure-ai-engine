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
        <ListsWidget className="sm:min-h-[clamp(180px,20vh,260px)] sm:min-w-0" />
        <CalendarWidget className="sm:min-h-[clamp(180px,20vh,260px)] sm:min-w-0" />
        <ConnectorsWidget className="sm:min-h-[clamp(180px,20vh,260px)] sm:min-w-0" />
        <TasksWidget className="sm:min-h-[clamp(180px,20vh,260px)] sm:min-w-0" />
      </>
    ),
    []
  );

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(132,106,255,0.15),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(68,212,255,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_35%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-10 px-4 pb-28 pt-12 sm:px-6 lg:px-12">
        <div className="relative grid min-h-[70vh] w-full grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-[clamp(240px,24vw,360px)_minmax(640px,1fr)_clamp(240px,24vw,360px)] lg:grid-rows-[auto_auto]">
          <CenterCanvas mode={mode} className="order-2 w-full md:order-1 md:col-span-2 lg:order-none lg:[grid-column:2] lg:[grid-row:1/span_2]" />

          {!isCompact && (
            <>
              <ListsWidget className="order-1 md:order-2 md:self-start lg:order-none lg:[grid-column:1] lg:[grid-row:1]" />
              <CalendarWidget className="order-3 md:order-3 md:self-start lg:order-none lg:[grid-column:3] lg:[grid-row:1]" />
              <ConnectorsWidget className="order-4 md:order-4 md:self-start lg:order-none lg:[grid-column:1] lg:[grid-row:2]" />
              <TasksWidget className="order-5 md:order-5 md:self-start lg:order-none lg:[grid-column:3] lg:[grid-row:2]" />
            </>
          )}

          {isCompact && (
            <div className="order-3 -mx-1 flex gap-3 overflow-x-auto pb-1 sm:hidden snap-x snap-mandatory">
              <ListsWidget className="min-w-[clamp(240px,70vw,320px)] snap-start" />
              <CalendarWidget className="min-w-[clamp(240px,70vw,320px)] snap-start" />
              <ConnectorsWidget className="min-w-[clamp(240px,70vw,320px)] snap-start" />
              <TasksWidget className="min-w-[clamp(240px,70vw,320px)] snap-start" />
            </div>
          )}
        </div>
      </div>

      <BottomBar mode={mode} onChange={onModeChange} />
    </div>
  );
}
