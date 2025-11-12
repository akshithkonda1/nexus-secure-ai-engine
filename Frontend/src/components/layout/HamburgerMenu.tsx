import { useEffect, useId, useRef, useState } from "react";
import IconButton from "@/components/ui/IconButton";

type Props = {
  mainSidebarId?: string;
  onToggleMainMenu?: () => void;
};

const isBrowser = typeof window !== "undefined";

export default function HamburgerMenu({ mainSidebarId, onToggleMainMenu }: Props) {
  const [open, setOpen] = useState(false);
  const labelId = useId();
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || typeof document === "undefined") {
      return;
    }

    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!isBrowser) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open || !drawerRef.current) {
      return;
    }

    const firstFocusable = drawerRef.current.querySelector<HTMLElement>(
      "button, a, input, [tabindex]:not([tabindex='-1'])",
    );
    firstFocusable?.focus();
  }, [open]);

  const toggleMain = () => {
    if (onToggleMainMenu) {
      onToggleMainMenu();
    } else if (mainSidebarId && typeof document !== "undefined") {
      const el = document.getElementById(mainSidebarId);
      if (el) {
        el.classList.toggle("translate-x-0");
        el.classList.toggle("-translate-x-full");
      }
    }

    setOpen(false);
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-[80]">
        <IconButton label="Open menu" onClick={() => setOpen(true)} className="h-12 w-12">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </IconButton>
      </div>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby={labelId} className="fixed inset-0 z-[75]">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div
            ref={drawerRef}
            className="absolute left-0 top-0 h-full w-[320px] bg-white dark:bg-slate-950 shadow-xl border-r border-slate-200/70 dark:border-slate-800 transform transition-transform translate-x-0"
          >
            <div className="p-4 flex items-center justify-between">
              <h2 id={labelId} className="text-sm font-semibold">
                Quick Menu
              </h2>
              <IconButton label="Close" onClick={() => setOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M6 6l12 12M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </IconButton>
            </div>

            <nav className="px-4 pb-6 space-y-4">
              <section className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Navigation</p>
                <button
                  className="w-full text-left rounded-xl border px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900"
                  onClick={toggleMain}
                >
                  Toggle Main Sidebar
                </button>
                <a
                  href="/chat"
                  className="block rounded-xl border px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Chat
                </a>
                <a
                  href="/projects"
                  className="block rounded-xl border px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Sessions
                </a>
              </section>

              <section className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Quick Toggles</p>
                <ThemeToggleRow />
                <DensityToggleRow />
              </section>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

function ThemeToggleRow() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (!isBrowser) return;

    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    if (typeof document === "undefined") {
      return;
    }
    document.documentElement.classList.toggle("dark");
    setIsDark(document.documentElement.classList.contains("dark"));
  };

  return (
    <button
      onClick={toggle}
      className="w-full text-left rounded-xl border px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900"
    >
      Theme: {isDark ? "Dark" : "Light"}
    </button>
  );
}

function DensityToggleRow() {
  const [isCompact, setIsCompact] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }
    return document.documentElement.classList.contains("compact-ui");
  });

  useEffect(() => {
    if (!isBrowser) return;

    const observer = new MutationObserver(() => {
      setIsCompact(document.documentElement.classList.contains("compact-ui"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    if (typeof document === "undefined") {
      return;
    }
    document.documentElement.classList.toggle("compact-ui");
    setIsCompact(document.documentElement.classList.contains("compact-ui"));
  };

  return (
    <button
      onClick={toggle}
      className="w-full text-left rounded-xl border px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900"
    >
      Density: {isCompact ? "Compact" : "Cozy"}
    </button>
  );
}
