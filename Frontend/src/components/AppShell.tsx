import { ReactNode, useEffect, useMemo, useState } from "react";

import { PanelFlag } from "@/constants/panels";
import { PanelToggle } from "@/components/PanelToggle";
import { usePanels } from "@/hooks/usePanels";

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

const RIGHT_PANEL_WIDTH = 320;

export default function AppShell({ left, right, children }: Props) {
  const { rightOpen, toggle } = usePanels();
  const isDesktop = useIsDesktop();

  const rightW = rightOpen && isDesktop ? RIGHT_PANEL_WIDTH : 0;

  const gridTemplateColumns = useMemo(
    () => (isDesktop ? `1fr ${rightW}px` : "1fr"),
    [isDesktop, rightW]
  );

  return (
    <div className="relative min-h-screen h-screen w-full overflow-hidden bg-[rgb(var(--bg))] text-[rgb(var(--text))] antialiased">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_-10%,rgba(148,163,184,0.22),transparent_55%),radial-gradient(circle_at_80%_120%,rgba(62,228,255,0.35),transparent_60%),radial-gradient(circle_at_10%_120%,rgba(139,92,246,0.4),transparent_65%)]"
      />
      <div className="relative z-10 flex h-full w-full items-stretch justify-stretch">
        <div
          className="grid h-full w-full transition-[grid-template-columns] duration-300 ease-out"
          style={{ gridTemplateColumns }}
        >
          <main className="min-w-0 overflow-y-auto [direction:ltr]">{children}</main>

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
        <div className="sr-only" aria-hidden>
          {left}
        </div>
      </div>
    </div>
  );
}
