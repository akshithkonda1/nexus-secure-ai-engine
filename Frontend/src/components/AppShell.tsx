import { ReactNode, useMemo } from "react";
import { usePanels } from "@/panels/PanelProvider";
import { PanelToggle } from "@/components/PanelToggle";

type Props = {
  left: ReactNode;
  right: ReactNode;
  children: ReactNode;
};

const LEFT_OPEN = 288;
const LEFT_COLLAPSED = 56;
const RIGHT_OPEN = 360;
const RIGHT_COLLAPSED = 0;
const RIGHT_TOGGLE_VISIBLE = 40;

export default function AppShell({ left, right, children }: Props) {
  const { leftOpen, rightOpen, toggleLeft, toggleRight } = usePanels();

  const leftW = leftOpen ? LEFT_OPEN : LEFT_COLLAPSED;
  const rightW = rightOpen ? RIGHT_OPEN : RIGHT_COLLAPSED;

  const gridCols = useMemo(() => {
    if (!leftOpen && !rightOpen) {
      return `${LEFT_COLLAPSED}px 1fr ${RIGHT_TOGGLE_VISIBLE}px`;
    }

    return `${leftW}px 1fr ${rightW}px`;
  }, [leftOpen, rightOpen, leftW, rightW]);

  return (
    <div className="h-screen w-full overflow-hidden">
      <div
        className="grid h-full transition-[grid-template-columns] duration-300 ease-out"
        style={{ gridTemplateColumns: gridCols }}
      >
        <aside
          className="relative overflow-hidden border-r border-slate-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-900/30"
          aria-expanded={leftOpen}
          data-collapsed={!leftOpen}
        >
          <div className="h-full">{left}</div>
          <PanelToggle side="left" open={leftOpen} onClick={toggleLeft} />
        </aside>

        <main className="min-w-0 overflow-y-auto">{children}</main>

        <aside
          className="relative overflow-hidden border-l border-slate-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-900/30"
          aria-expanded={rightOpen}
          data-collapsed={!rightOpen}
        >
          <div className="h-full">{right}</div>
          <PanelToggle side="right" open={rightOpen} onClick={toggleRight} />
        </aside>
      </div>
    </div>
  );
}
