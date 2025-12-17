import { ElementType } from "react";
import { Activity, BookOpen, Home, Kanban, NotebookPen, Workflow } from "lucide-react";
import { CanvasMode } from "./types";

type BottomBarProps = {
  mode: CanvasMode;
  onChange: (mode: CanvasMode) => void;
  onHome: () => void;
};

const items: { id: CanvasMode; label: string; icon: ElementType }[] = [
  { id: "pages", label: "Pages", icon: BookOpen },
  { id: "notes", label: "Notes", icon: NotebookPen },
  { id: "boards", label: "Boards", icon: Kanban },
  { id: "flows", label: "Flows", icon: Workflow },
  { id: "analyze", label: "Analyze", icon: Activity },
];

export default function BottomBar({ mode, onChange, onHome }: BottomBarProps) {
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-30 w-[clamp(420px,40vw,560px)] -translate-x-1/2 px-4 sm:px-6 lg:px-7">
      <div className="pointer-events-auto w-full rounded-full bg-[var(--bg-surface)]/85 px-2 py-1.5 shadow-[0_22px_70px_-58px_rgba(0,0,0,0.85)] ring-1 ring-[var(--line-subtle)]/40 backdrop-blur-2xl">
        <div className="flex items-center gap-1.5">
          <div className="flex flex-1 items-center gap-1.5">
            {items.map((item) => {
              const Icon = item.icon;
              const active = item.id === mode;
              const analyze = item.id === "analyze";
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  aria-label={`${item.label} mode`}
                  onClick={() => onChange(item.id)}
                  className={`flex flex-1 items-center justify-center rounded-xl px-2.5 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] ${
                    active
                      ? `${
                          analyze
                            ? "bg-[var(--accent)]/18 text-[var(--text)] shadow-[0_10px_36px_-24px_rgba(0,0,0,0.35)] ring-1 ring-[var(--accent)]/70"
                            : "bg-[var(--bg-elev)]/90 text-[var(--text)] shadow-[0_10px_36px_-24px_rgba(0,0,0,0.4)] ring-1 ring-[var(--line-subtle)]/70"
                        }`
                      : `${
                          analyze
                            ? "bg-[var(--accent)]/12 text-[var(--text)] ring-1 ring-[var(--accent)]/40 hover:bg-[var(--accent)]/20"
                            : "text-[var(--muted)] hover:bg-[var(--bg-elev)]/60 hover:text-[var(--text)]"
                        }`
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      analyze
                        ? "bg-[var(--accent)]/18 text-[var(--text)] ring-[var(--accent)]/60"
                        : "ring-[var(--line-subtle)]/70"
                    } ${active ? "bg-[var(--bg-surface)]" : "bg-[var(--layer-muted)]/80"} text-[var(--text)] shadow-sm ring-1`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Home"
            onClick={onHome}
            className="flex items-center gap-2 rounded-xl bg-[var(--bg-elev)]/90 px-2.5 py-2 text-[var(--text)] shadow-[0_12px_38px_-26px_rgba(0,0,0,0.5)] ring-1 ring-[var(--line-subtle)]/70 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] hover:brightness-110"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-surface)] text-[var(--text)] shadow-sm ring-1 ring-[var(--line-subtle)]/70">
              <Home className="h-4 w-4" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
