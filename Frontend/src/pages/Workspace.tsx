import { useState } from "react";
import { Activity, BookOpen, CalendarClock, CheckSquare2, Kanban, ListChecks, NotepadText, PlugZap, Workflow } from "lucide-react";
import WorkspaceSurface from "../components/workspace/WorkspaceSurface";

const cornerApps = [
  {
    id: "connectors",
    title: "Connectors",
    focus: "Ecosystems linked",
    icon: PlugZap,
    notes: ["All endpoints authenticated", "Sync intervals relaxed", "No alerts raised"],
  },
  {
    id: "lists",
    title: "Lists",
    focus: "Semantic shelves",
    icon: ListChecks,
    notes: ["Themes grouped by intent", "Steady cadence, no rush", "Safe to pause anytime"],
  },
  {
    id: "tasks",
    title: "Tasks",
    focus: "Short horizon tasks",
    icon: CheckSquare2,
    notes: ["Owners visible, not urgent", "Time checks ready", "Snoozes allowed"],
  },
  {
    id: "calendar",
    title: "Calendar",
    focus: "Time authority",
    icon: CalendarClock,
    notes: ["Day schedule synced", "Time guardrails active", "Tasks on hold by time"],
  },
];

const interfaceBar = [
  { id: "pages", label: "Pages", description: "Project narratives", hotkey: "P", icon: BookOpen },
  { id: "notes", label: "Notes", description: "Lightweight scratchpads", hotkey: "N", icon: NotepadText },
  { id: "boards", label: "Boards", description: "Simple lanes", hotkey: "B", icon: Kanban },
  { id: "flows", label: "Flows", description: "Calm automations", hotkey: "F", icon: Workflow },
  { id: "toron", label: "Analyze with Toron", description: "Call overlays as needed", hotkey: "A", icon: Activity },
];

const placement = {
  connectors: "top-14 left-16",
  lists: "top-14 right-16",
  tasks: "bottom-32 left-20",
  calendar: "bottom-32 right-20",
};

export default function WorkspacePage() {
  const [activeInterface, setActiveInterface] = useState(interfaceBar[0].id);

  return (
    <section className="relative">
      <div className="relative min-h-[960px] overflow-hidden rounded-[48px] border border-white/30 bg-gradient-to-b from-[#e8f2ff] via-[#dfe6f5] to-[#0f1f45] p-10 shadow-[0_30px_120px_rgba(12,25,64,0.24)] backdrop-blur-2xl dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,158,255,0.14),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(171,141,255,0.12),transparent_30%),radial-gradient(circle_at_48%_86%,rgba(83,166,255,0.12),transparent_32%)]" />
        <div className="pointer-events-none absolute inset-5 rounded-[40px] border border-white/30" />

        <div className="pointer-events-none absolute left-20 top-24 h-96 w-[420px] rounded-[80px] bg-white/30 blur-3xl" />
        <div className="pointer-events-none absolute right-16 top-16 h-80 w-[460px] rounded-[80px] bg-white/30 blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 left-24 h-72 w-[460px] rounded-[88px] bg-white/25 blur-3xl" />
        <div className="pointer-events-none absolute bottom-16 right-24 h-72 w-[420px] rounded-[88px] bg-white/25 blur-3xl" />

        <div className="relative flex h-full flex-col">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-16 rounded-[34px] border border-white/20 bg-white/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5" />
            <div className="absolute inset-0 flex items-center justify-center px-24">
              <WorkspaceSurface items={interfaceBar} activeId={activeInterface} onSelect={setActiveInterface} />
            </div>

            {cornerApps.map((app) => (
              <div
                key={app.id}
                className={`absolute ${placement[app.id as keyof typeof placement]} w-[360px] max-w-full space-y-4 rounded-[30px] border border-white/30 bg-gradient-to-b from-white/80 to-white/60 p-6 shadow-[0_22px_70px_rgba(10,24,56,0.22)] backdrop-blur-2xl dark:border-white/10 dark:from-white/10 dark:to-white/5`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[var(--text-strong)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80 text-[var(--text-primary)] ring-1 ring-white/40 shadow-inner dark:bg-white/10 dark:ring-white/10">
                      <app.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold tracking-tight">{app.title}</p>
                      <p className="text-[12px] text-[var(--text-muted)]">{app.focus}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/40 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-muted)] shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                    Status-only
                  </span>
                </div>
                <div className="space-y-3 text-sm text-[var(--text-primary)]">
                  {app.notes.map((note) => (
                    <div key={note} className="flex items-start gap-3 rounded-2xl border border-white/30 bg-white/70 px-4 py-3 text-[13px] leading-relaxed shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                      <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[var(--ryuzen-azure)]" aria-hidden />
                      <span className="text-[var(--text-strong)]">{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
