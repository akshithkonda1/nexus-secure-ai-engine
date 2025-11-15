import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePanels } from "@/hooks/usePanels";
import { PanelToggle } from "@/components/PanelToggle";
import { PanelFlag } from "@/constants/panels";
import { useSidebar } from "@/components/layout/sidebar/SidebarContext";

type Props = {
  left: ReactNode;
  right: ReactNode;
  children: ReactNode;
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

const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_EXPANDED_WIDTH = 288;
const RIGHT_PANEL_WIDTH = 320;

export default function AppShell({ left, right, children }: Props) {
  const { leftOpen, rightOpen, toggle } = usePanels();
  const isDesktop = useIsDesktop();
  const { collapsed } = useSidebar();

  const baseSidebarWidth = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_EXPANDED_WIDTH;
  const leftW = leftOpen ? baseSidebarWidth : 0;
  const rightW = rightOpen ? RIGHT_PANEL_WIDTH : 0;

  const gridTemplateColumns = useMemo(
    () => (isDesktop ? `${leftW}px 1fr ${rightW}px` : "1fr"),
    [isDesktop, leftW, rightW]
  );

  return (
    <div className="relative min-h-screen h-screen w-full overflow-hidden bg-[rgb(var(--bg))] text-[rgb(var(--text))] antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_18%_115%,rgba(59,130,246,0.32),transparent_68%),radial-gradient(circle_at_82%_-10%,rgba(196,181,253,0.28),transparent_62%),radial-gradient(circle_at_50%_18%,rgba(56,189,248,0.22),transparent_58%),radial-gradient(circle_at_48%_82%,rgba(34,197,94,0.18),transparent_70%),linear-gradient(120deg,rgba(6,10,24,0.92)0%,rgba(9,14,30,0.88)38%,rgba(12,18,36,0.86)62%,rgba(8,11,22,0.92)100%)]"
      />
      <div className="relative z-10 flex h-full w-full items-stretch justify-stretch">
        <div
          className="grid h-full w-full transition-[grid-template-columns] duration-300 ease-out"
          style={{ gridTemplateColumns }}
        >
          <aside
            className="relative overflow-visible"
            style={{ width: isDesktop ? leftW : 0 }}
            aria-expanded={leftOpen && isDesktop}
            aria-hidden={!isDesktop}
          >
            <div className="h-full w-full">{left}</div>
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
            className="relative overflow-visible"
            style={{ width: isDesktop ? rightW : 0 }}
            aria-expanded={rightOpen && isDesktop}
            aria-hidden={!isDesktop}
          >
            <div className="h-full w-full">{right}</div>
            {isDesktop && (
              <PanelToggle
                side="right"
                open={rightOpen}
                onClick={() => toggle(PanelFlag.RIGHT_OPEN)}
              />
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
