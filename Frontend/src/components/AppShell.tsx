import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePanels } from "@/hooks/usePanels";
import { PanelToggle } from "@/components/PanelToggle";

type Props = {
  left: ReactNode;     // existing Sidebar component
  right: ReactNode;    // existing Right rail component
  children: ReactNode; // main content
};

const LG_BREAKPOINT = 1024;
const isBrowser = typeof window !== "undefined";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() =>
    isBrowser ? window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`).matches : true,
  );

  useEffect(() => {
    if (!isBrowser) return;

    const mql = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);
    const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);

    setIsDesktop(mql.matches);
    mql.addEventListener("change", handleChange);

    return () => {
      mql.removeEventListener("change", handleChange);
    };
  }, []);

  return isDesktop;
}

export default function AppShell({ left, right, children }: Props) {
  const { leftOpen, rightOpen, toggleLeft, toggleRight } = usePanels();
  const isDesktop = useIsDesktop();

  // Tune these to your design
  const LEFT_OPEN = 288;       // px (match w-72)
  const LEFT_COLLAPSED = 56;   // px (icon-only)
  const RIGHT_OPEN = 320;      // px (match max-w-xs)
  const RIGHT_COLLAPSED = 0;   // px (hidden)

  const leftW = leftOpen ? LEFT_OPEN : LEFT_COLLAPSED;
  const rightW = rightOpen ? RIGHT_OPEN : RIGHT_COLLAPSED;

  const gridTemplate = useMemo(
    () => (isDesktop ? `${leftW}px 1fr ${rightW}px` : "1fr"),
    [isDesktop, leftW, rightW]
  );

  return (
    <div className="h-screen w-full overflow-hidden">
      <div
        className="grid h-full transition-[grid-template-columns] duration-300 ease-out"
        style={{ gridTemplateColumns: gridTemplate }}
      >
        {/* LEFT SIDEBAR (width-only animation) */}
        <aside
          className="relative border-r border-slate-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-900/30 overflow-hidden"
          style={{ width: isDesktop ? leftW : 0 }}
          aria-expanded={leftOpen && isDesktop}
          aria-hidden={!isDesktop}
        >
          <div className="h-full">{left}</div>
          {isDesktop && (
            <PanelToggle side="left" open={leftOpen} onClick={toggleLeft} />
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="min-w-0 overflow-y-auto">
          {children}
        </main>

        {/* RIGHT RAIL */}
        <aside
          className="relative border-l border-slate-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-900/30 overflow-hidden"
          style={{ width: isDesktop ? rightW : 0 }}
          aria-expanded={rightOpen && isDesktop}
          aria-hidden={!isDesktop}
        >
          <div className="h-full">{right}</div>
          {isDesktop && (
            <PanelToggle side="right" open={rightOpen} onClick={toggleRight} />
          )}
        </aside>
      </div>
    </div>
  );
}
