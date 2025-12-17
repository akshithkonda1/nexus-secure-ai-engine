import { Sparkles } from "lucide-react";
import { CanvasMode } from "./types";

const copyByMode: Record<CanvasMode, { title: string; subtitle: string }> = {
  pages: { title: "Pages", subtitle: "Narratives, blueprints, and full context." },
  notes: { title: "Notes", subtitle: "Scratchpads stay calm until you're ready." },
  boards: { title: "Boards", subtitle: "Swimlanes for steady, predictable flow." },
  flows: { title: "Flows", subtitle: "Automations that respect human pacing." },
  analyze: { title: "Analyze with Toron", subtitle: "Observability and insights without overwhelm." },
};

const clearedCopy = {
  title: "Canvas is clear",
  subtitle: "Your work is safe. Pick a mode to reopen it instantly.",
};

type CenterCanvasProps = {
  mode: CanvasMode;
  className?: string;
  isCleared?: boolean;
};

export default function CenterCanvas({ mode, className, isCleared = false }: CenterCanvasProps) {
  const content = isCleared ? clearedCopy : copyByMode[mode];

  return (
    <section
      aria-label="Center canvas"
      className={`relative flex h-full min-h-[60vh] flex-col justify-between overflow-hidden rounded-[28px] bg-gradient-to-b from-[var(--bg-surface)]/55 via-[var(--bg-elev)]/35 to-[var(--bg-app)]/15 p-8 text-[var(--text)] transition-[background,transform] backdrop-blur-xl ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">{isCleared ? "Home" : "Focus surface"}</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--text)]">{content.title}</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{content.subtitle}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--bg-elev)]/80 text-[var(--accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-[var(--line-subtle)]/40">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-8 flex flex-1 items-center justify-center rounded-[22px] bg-gradient-to-b from-[var(--bg-elev)]/30 via-[var(--layer-muted)]/20 to-transparent px-8 py-12 text-[var(--muted)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur">
        <div className="max-w-xl space-y-3 text-center">
          <p className="text-base font-semibold text-[var(--text)]">{isCleared ? "Workspace ready" : "Center is clear"}</p>
          <p className="text-sm text-[var(--text-muted)]">
            {isCleared
              ? "You've cleared the canvas view. Select any mode to resume right where you left off."
              : "Bring calm structure into this canvas. The bottom bar is your only switcher—everything else stays focused on its own space."}
          </p>
        </div>
      </div>
    </section>
  );
}
