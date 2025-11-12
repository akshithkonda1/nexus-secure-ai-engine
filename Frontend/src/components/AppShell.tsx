import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePanels } from "@/hooks/usePanels";
import { PanelToggle } from "@/components/PanelToggle";
import { PanelFlag } from "@/constants/panels";
import BackButtons from "@/components/layout/BackButtons";
import HamburgerMenu from "@/components/layout/HamburgerMenu";

type Props = {
  left: ReactNode;
  right: ReactNode;
  children: ReactNode;
  mainSidebarId?: string;
  onToggleMainSidebar?: () => void;
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

const LEFT_PANEL_WIDTH = 320;
const RIGHT_PANEL_WIDTH = 320;

export default function AppShell({
  left,
  right,
  children,
  mainSidebarId,
  onToggleMainSidebar,
}: Props) {
  const { leftOpen, rightOpen, toggle } = usePanels();
  const isDesktop = useIsDesktop();

  const leftW = leftOpen ? LEFT_PANEL_WIDTH : 0;
  const rightW = rightOpen ? RIGHT_PANEL_WIDTH : 0;

  const gridTemplateColumns = useMemo(
    () => (isDesktop ? `${leftW}px 1fr ${rightW}px` : "1fr"),
    [isDesktop, leftW, rightW]
  );

  return (
    <div className="h-screen w-full overflow-hidden">
      <div
        className="grid h-full transition-[grid-template-columns] duration-300 ease-out"
        style={{ gridTemplateColumns }}
      >
        <aside
          className="relative border-r border-slate-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-900/30 overflow-hidden"
          style={{ width: isDesktop ? leftW : 0 }}
          aria-expanded={leftOpen && isDesktop}
          aria-hidden={!isDesktop}
        >
          <div className="h-full">{left}</div>
            {isDesktop && (
              <PanelToggle
                side="left"
                open={leftOpen}
                onClick={() => toggle(PanelFlag.LEFT_OPEN)}
              />
            )}
        </aside>

        <main className="min-w-0 overflow-y-auto">{children}</main>

        <aside
          className="relative border-l border-slate-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-slate-900/30 overflow-hidden"
          style={{ width: isDesktop ? rightW : 0 }}
          aria-expanded={rightOpen && isDesktop}
          aria-hidden={!isDesktop}
        >
          <div className="h-full">{right}</div>
            {isDesktop && (
              <PanelToggle
                side="right"
                open={rightOpen}
                onClick={() => toggle(PanelFlag.RIGHT_OPEN)}
              />
            )}
        </aside>
      </div>

      <HamburgerMenu
        mainSidebarId={mainSidebarId}
        onToggleMainMenu={onToggleMainSidebar}
      />
      <BackButtons />
    </div>
  );
}
