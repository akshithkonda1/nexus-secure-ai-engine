import { type CSSProperties, useEffect, useState } from "react";
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

  const anchorStyles: CSSProperties = {
    "--anchor-x": "clamp(24px, 4vw, 64px)",
    "--anchor-top": "clamp(32px, 6vh, 82px)",
    "--anchor-bottom": "calc(clamp(32px, 6vh, 82px) + 92px)",
  };

  return (
    <div className="relative isolate min-h-screen w-full overflow-hidden bg-[var(--bg-app)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(132,106,255,0.16),transparent_36%),radial-gradient(circle_at_78%_6%,rgba(68,212,255,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.05)_0%,transparent_40%)]" />

      <div className="relative z-10 min-h-screen w-full" style={anchorStyles}>
        {!isCompact && (
          <>
            <CenterCanvas
              mode={mode}
              className="absolute left-1/2 top-1/2 w-[70vw] max-w-none -translate-x-1/2 -translate-y-1/2"
            />

            <ListsWidget className="absolute left-[var(--anchor-x)] top-[var(--anchor-top)]" />
            <CalendarWidget className="absolute right-[var(--anchor-x)] top-[var(--anchor-top)]" />
            <ConnectorsWidget className="absolute bottom-[var(--anchor-bottom)] left-[var(--anchor-x)]" />
            <TasksWidget className="absolute bottom-[var(--anchor-bottom)] right-[var(--anchor-x)]" />
          </>
        )}

        {isCompact && (
          <div
            className="relative z-10 -mb-2 flex gap-4 overflow-x-auto pb-2 sm:hidden snap-x snap-mandatory"
            style={{ marginTop: "var(--anchor-top)", paddingLeft: "var(--anchor-x)", paddingRight: "var(--anchor-x)" }}
          >
            <ListsWidget className="min-w-[clamp(240px,70vw,320px)] snap-start" />
            <CalendarWidget className="min-w-[clamp(240px,70vw,320px)] snap-start" />
            <ConnectorsWidget className="min-w-[clamp(240px,70vw,320px)] snap-start" />
            <TasksWidget className="min-w-[clamp(240px,70vw,320px)] snap-start" />
          </div>
        )}
      </div>

      <BottomBar mode={mode} onChange={onModeChange} />
    </div>
  );
}
