import { Bell, Menu, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

type HeaderProps = {
  onToggleSidebar?: () => void;
};

export function Header({ onToggleSidebar }: HeaderProps = {}) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-[rgb(var(--panel))]/80 backdrop-blur">
      <div className="h-16 flex items-center gap-4 px-4 sm:px-6">
        <button
          className="flex size-10 items-center justify-center rounded-xl border border-border/60 bg-surface/60 text-subtle sm:hidden"
          onClick={() => onToggleSidebar?.()}
          aria-label="Toggle navigation"
        >
          <Menu className="size-4" />
        </button>
        <button
          onClick={() => navigate("/home")}
          className="hidden sm:inline-flex rounded-xl border border-border/60 px-3 py-2 text-sm font-medium shadow-[0_10px_28px_rgba(0,0,0,0.12)]"
        >
          Nexus <span className="ml-1 text-[10px] font-normal uppercase tracking-[0.2em] text-subtle">beta</span>
        </button>
        <div className="flex-1">
          <div className="relative">
            <input
              placeholder="Search workspace, sessions, commands…"
              className="h-10 w-full rounded-xl border border-border/60 bg-surface/60 px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/templates")}
            className="h-10 rounded-xl border border-border/60 bg-surface/60 px-4 text-sm font-medium flex items-center gap-2"
          >
            <Sparkles className="size-4" /> Prompts
          </button>
          <button
            onClick={() => navigate("/sessions")}
            className="h-10 rounded-xl text-white px-4 text-sm font-medium flex items-center gap-2"
            style={{ backgroundColor: "var(--brand)" }}
          >
            <ShieldCheck className="size-4" /> Launch console
          </button>
          <button className="relative flex size-10 items-center justify-center rounded-full border border-border/60 bg-surface/60">
            <Bell className="size-4 text-subtle" />
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[color:var(--brand)] text-[10px] text-white">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
