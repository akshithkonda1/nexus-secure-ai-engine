import { useEffect, useRef, useState } from "react";

interface MoreMenuProps {
  browsing: boolean;
  agentMode: boolean;
  onToggleBrowsing: () => void;
  onToggleAgent: () => void;
}

export function MoreMenu({ browsing, agentMode, onToggleAgent, onToggleBrowsing }: MoreMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="More settings"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--panel-elevated)_72%,transparent)] text-[var(--text-primary)] shadow-[0_12px_36px_rgba(0,0,0,0.35)] backdrop-blur transition hover:bg-white/10"
      >
        <img src="/assets/icons/more.svg" alt="More" className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-52 rounded-2xl border border-white/10 bg-[color-mix(in_srgb,var(--panel-elevated)_94%,transparent)] p-2 shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] transition hover:bg-white/10"
            onClick={() => {
              onToggleBrowsing();
              setOpen(false);
            }}
          >
            <span>Toron Browsing</span>
            <span className={`h-5 w-9 rounded-full border border-white/15 bg-white/5 transition ${browsing ? "bg-[color-mix(in_srgb,var(--accent-primary)_40%,transparent)]" : ""}`}>
              <span
                className={`block h-4 w-4 translate-y-[2px] rounded-full bg-white shadow transition ${browsing ? "translate-x-[18px]" : "translate-x-[2px]"}`}
              />
            </span>
          </button>
          <button
            type="button"
            className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] transition hover:bg-white/10"
            onClick={() => {
              onToggleAgent();
              setOpen(false);
            }}
          >
            <span>Agent Mode</span>
            <span className={`h-5 w-9 rounded-full border border-white/15 bg-white/5 transition ${agentMode ? "bg-[color-mix(in_srgb,var(--accent-secondary)_40%,transparent)]" : ""}`}>
              <span
                className={`block h-4 w-4 translate-y-[2px] rounded-full bg-white shadow transition ${agentMode ? "translate-x-[18px]" : "translate-x-[2px]"}`}
              />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

export default MoreMenu;
