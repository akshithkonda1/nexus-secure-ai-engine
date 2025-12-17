import { Sparkles } from "lucide-react";
import { CanvasMode } from "./types";

const copyByMode: Record<CanvasMode, { title: string; subtitle: string }> = {
  pages: { title: "Pages", subtitle: "Narratives, blueprints, and full context." },
  notes: { title: "Notes", subtitle: "Scratchpads stay calm until you're ready." },
  boards: { title: "Boards", subtitle: "Swimlanes for steady, predictable flow." },
  flows: { title: "Flows", subtitle: "Automations that respect human pacing." },
  analyze: { title: "Analyze with Toron", subtitle: "Observability and insights without overwhelm." },
};

type CenterCanvasProps = {
  mode: CanvasMode;
  className?: string;
};

export default function CenterCanvas({ mode, className }: CenterCanvasProps) {
  const content = copyByMode[mode];

  return (
    <section
      aria-label="Center canvas"
      className={`flex h-full min-h-[60vh] flex-col justify-between overflow-hidden rounded-[24px] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-colors ${className ?? ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)]">Focus surface</p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--text)]">{content.title}</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">{content.subtitle}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--bg-elev)] text-[var(--accent)] shadow-inner ring-1 ring-[var(--line-subtle)]">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-6 flex flex-1 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-6 py-10 text-[var(--muted)] shadow-inner backdrop-blur-lg">
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--text)]">Center is clear</p>
          <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
            Bring calm structure into this canvas. The bottom bar is your only switcher—everything else stays focused on its own space.
          </p>
        </div>
      </div>
    </section>
  );
}
