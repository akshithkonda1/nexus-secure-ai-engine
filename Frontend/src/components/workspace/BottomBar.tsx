import { ElementType } from "react";
import { Activity, BookOpen, Kanban, NotebookPen, Workflow } from "lucide-react";
import { CanvasMode } from "./types";

type BottomBarProps = {
  mode: CanvasMode;
  onChange: (mode: CanvasMode) => void;
};

const items: { id: CanvasMode; label: string; description: string; icon: ElementType }[] = [
  { id: "pages", label: "Pages", description: "Narratives", icon: BookOpen },
  { id: "notes", label: "Notes", description: "Scratch", icon: NotebookPen },
  { id: "boards", label: "Boards", description: "Swimlanes", icon: Kanban },
  { id: "flows", label: "Flows", description: "Automations", icon: Workflow },
  { id: "analyze", label: "Analyze", description: "With Toron", icon: Activity },
];

export default function BottomBar({ mode, onChange }: BottomBarProps) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30">
      <div className="pointer-events-auto mx-auto w-full max-w-5xl px-4">
        <div className="flex items-center justify-between gap-2 rounded-full bg-[var(--bg-surface)]/85 px-4 py-3 shadow-[0_24px_80px_-60px_rgba(0,0,0,0.85)] ring-1 ring-[var(--line-subtle)]/60 backdrop-blur-2xl">
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
                className={`flex flex-1 items-center gap-2 rounded-xl px-2 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-surface)] ${
                  active
                    ? "bg-[var(--bg-elev)]/90 text-[var(--text)] shadow-inner"
                    : "text-[var(--muted)] hover:bg-[var(--bg-elev)]/60 hover:text-[var(--text)]"
                }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-[var(--bg-surface)]" : "bg-[var(--layer-muted)]/80"} text-[var(--text)] shadow-sm ring-1 ring-[var(--line-subtle)]/70`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex flex-col">
                  <span className="text-sm font-semibold leading-tight">{item.label}</span>
                  <span className="text-xs text-[var(--text-muted)]">{item.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
