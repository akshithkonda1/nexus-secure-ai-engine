import { ElementType } from "react";
import { Activity, BookOpen, Home, Kanban, NotebookPen, Workflow } from "lucide-react";
import { CanvasMode } from "./types";

type BottomBarProps = {
  mode: CanvasMode;
  onChange: (mode: CanvasMode) => void;
  onHome: () => void;
};

const items: { id: CanvasMode; label: string; description: string; icon: ElementType }[] = [
  { id: "pages", label: "Pages", description: "Narratives", icon: BookOpen },
  { id: "notes", label: "Notes", description: "Scratch", icon: NotebookPen },
  { id: "boards", label: "Boards", description: "Swimlanes", icon: Kanban },
  { id: "flows", label: "Flows", description: "Automations", icon: Workflow },
  { id: "analyze", label: "Analyze", description: "With Toron", icon: Activity },
];

export default function BottomBar({ mode, onChange, onHome }: BottomBarProps) {
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-30 w-[min(1200px,_calc(100%_-_32px))] -translate-x-1/2 px-4 sm:w-[min(1200px,_calc(100%_-_48px))] sm:px-6 lg:w-[min(1200px,_calc(100%_-_80px))] lg:px-8">
      <div className="pointer-events-auto w-full rounded-full bg-[var(--bg-surface)]/85 px-3 py-2 shadow-[0_22px_70px_-58px_rgba(0,0,0,0.85)] ring-1 ring-[var(--line-subtle)]/40 backdrop-blur-2xl">
        <div className="flex items-center gap-2">
          <div className="flex flex-1 items-center gap-2">
            {items.map((item) => {
              const Icon = item.icon;
              const active = item.id === mode;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={active ? "page" : undefined}
                  aria-label={`${item.label} mode`}
                  onClick={() => onChange(item.id)}
                  className={`flex flex-1 items-center gap-2 rounded-xl px-2 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] ${
                    active
                      ? "bg-[var(--bg-elev)]/90 text-[var(--text)] shadow-inner"
                      : "text-[var(--muted)] hover:bg-[var(--bg-elev)]/60 hover:text-[var(--text)]"
                  }`}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${active ? "bg-[var(--bg-surface)]" : "bg-[var(--layer-muted)]/80"} text-[var(--text)] shadow-sm ring-1 ring-[var(--line-subtle)]/70`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="flex flex-col">
                    <span className="text-[11px] font-semibold leading-tight">{item.label}</span>
                    <span className="text-[9px] text-[var(--text-muted)]">{item.description}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Home"
            onClick={onHome}
            className="flex items-center gap-2 rounded-xl bg-[var(--bg-elev)]/90 px-3 py-2 text-[var(--text)] shadow-inner transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] hover:brightness-110"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bg-surface)] text-[var(--text)] shadow-sm ring-1 ring-[var(--line-subtle)]/70">
              <Home className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold leading-tight">Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
