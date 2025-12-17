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
    <div className="relative flex h-full w-full flex-col gap-4 rounded-[28px] bg-[var(--bg-app)]/60 p-[clamp(32px,6vw,96px)] pb-[calc(var(--workspace-bar-height,96px)+clamp(24px,4vh,48px))] shadow-[var(--shadow-med)] ring-1 ring-[var(--line-subtle)] backdrop-blur-xl">
      <div className="relative flex-1 rounded-[24px] bg-[var(--bg-surface)]/60 p-2 ring-1 ring-[var(--line-subtle)]">
        <div
          className="relative flex h-full flex-col gap-6 rounded-2xl bg-[var(--bg-surface)]/78 p-3 sm:p-5"
        >
          <div className="relative hidden min-h-[clamp(760px,78vh,1120px)] flex-1 items-center justify-center px-[clamp(48px,9vw,144px)] py-[clamp(40px,8vh,120px)] lg:flex">
            <CenterCanvas mode={mode} className="z-10 max-w-[clamp(720px,52vw,960px)]" />

            <div className="pointer-events-none absolute inset-[clamp(56px,8vw,136px)]" aria-hidden />

            <div className="absolute lg:[top:clamp(32px,5vh,64px)] lg:[left:clamp(32px,5vw,72px)]">
              <ListsWidget className="lg:min-h-[clamp(200px,22vh,280px)] lg:min-w-[clamp(260px,22vw,360px)]" />
            </div>

            <div className="absolute lg:[top:clamp(32px,5vh,64px)] lg:[right:clamp(32px,5vw,72px)]">
              <CalendarWidget className="lg:min-h-[clamp(200px,22vh,280px)] lg:min-w-[clamp(260px,22vw,360px)]" />
            </div>

            <div className="absolute lg:[bottom:clamp(112px,14vh,160px)] lg:[left:clamp(32px,5vw,72px)]">
              <ConnectorsWidget className="lg:min-h-[clamp(200px,22vh,280px)] lg:min-w-[clamp(260px,22vw,360px)]" />
            </div>

            <div className="absolute lg:[bottom:clamp(112px,14vh,160px)] lg:[right:clamp(32px,5vw,72px)]">
              <TasksWidget className="lg:min-h-[clamp(200px,22vh,280px)] lg:min-w-[clamp(260px,22vw,360px)]" />
            </div>
          </div>

          <div className="flex h-full flex-col gap-6 lg:hidden">
            <CenterCanvas mode={mode} className="order-1" />

            {!isCompact && <div className="order-2 hidden gap-4 sm:grid sm:grid-cols-2">{widgets}</div>}

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
