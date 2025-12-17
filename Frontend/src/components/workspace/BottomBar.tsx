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
    <div className="sticky bottom-0 left-0 right-0 z-30 pt-2">
      <div className="pointer-events-none mx-auto max-w-6xl">
        <div className="pointer-events-auto flex items-center justify-between gap-2 rounded-2xl border border-[var(--line-subtle)] bg-[var(--bg-surface)]/90 px-3 py-3 shadow-[var(--shadow-soft)] backdrop-blur-md">
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
                    ? "bg-[var(--bg-elev)] text-[var(--text)] shadow-inner"
                    : "text-[var(--muted)] hover:bg-[var(--bg-elev)] hover:text-[var(--text)]"
                }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? "bg-[var(--bg-surface)]" : "bg-[var(--layer-muted)]"} text-[var(--text)] shadow-sm ring-1 ring-[var(--line-subtle)]`}>
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
