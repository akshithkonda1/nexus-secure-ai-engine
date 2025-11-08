import { useNavigate } from "react-router-dom";

type HeaderProps = {
  onToggleSidebar?: () => void;
};

export function Header({ onToggleSidebar }: HeaderProps = {}) {
  const nav = useNavigate();
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 border-b border-[var(--nexus-border)] bg-[var(--nexus-surface)] backdrop-blur">
      <div className="h-full max-w-screen-2xl mx-auto flex items-center gap-3 px-3 md:px-6">
        <button
          className="md:hidden h-9 w-9 rounded-lg border border-white/10 bg-white/10 text-white"
          onClick={() => onToggleSidebar?.()}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
        <button className="rounded-md px-2 py-1 text-sm bg-white/10 border border-white/10" onClick={() => nav("/home")}>
          Nexus <span className="text-[10px] opacity-70 align-top">BETA</span>
        </button>
        <input
          placeholder="Search workspace, sessions, commands…"
          className="flex-1 h-9 rounded-lg bg-black/20 border border-white/10 px-3 text-sm"
        />
        <button className="h-9 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 text-sm" onClick={() => nav("/sessions")}>
          Launch Console
        </button>
        <button className="h-9 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 px-3 text-sm" onClick={() => nav("/templates")}>
          Browse Templates
        </button>
      </div>
    </header>
  );
}
