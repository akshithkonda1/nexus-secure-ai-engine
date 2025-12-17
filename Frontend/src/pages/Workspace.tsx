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
    focus: "Short horizon",
    icon: CheckSquare2,
    notes: ["Today only, no backlog", "Owners visible at a glance", "Deferral is acceptable"],
  },
  {
    id: "calendar",
    title: "Calendar",
    focus: "Time authority",
    icon: CalendarClock,
    notes: ["Events anchor the day", "Tasks respect the clock", "Gaps stay breathable"],
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
  connectors: "top-8 left-8",
  lists: "top-8 right-8",
  tasks: "bottom-36 left-8",
  calendar: "bottom-36 right-8",
};

export default function WorkspacePage() {
  const [activeInterface, setActiveInterface] = useState(interfaceBar[0].id);

  return (
    <section className="relative">
      <div className="relative min-h-[900px] overflow-hidden rounded-[40px] border border-white/20 bg-white/40 p-8 shadow-[0_28px_90px_rgba(15,23,42,0.14)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(0,158,255,0.06),transparent_34%),radial-gradient(circle_at_88%_14%,rgba(147,96,255,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0.3)_18%,rgba(255,255,255,0)_46%)]" />
        <div className="pointer-events-none absolute inset-6 rounded-[32px] border border-white/18" />

        <div className="relative flex h-full flex-col">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-20 rounded-[28px] border border-white/18 bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] dark:border-white/10 dark:bg-white/5" />
            <div className="absolute inset-0 flex items-center justify-center px-24">
              <WorkspaceSurface items={interfaceBar} activeId={activeInterface} onSelect={setActiveInterface} />
            </div>

            {cornerApps.map((app) => (
              <div
                key={app.id}
                className={`absolute ${placement[app.id as keyof typeof placement]} w-[320px] max-w-full space-y-3 rounded-3xl border border-white/20 bg-white/70 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-white/10 dark:bg-white/10`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[var(--text-strong)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 text-[var(--text-primary)] ring-1 ring-white/30 shadow-inner dark:bg-white/10 dark:ring-white/10">
                      <app.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{app.title}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{app.focus}</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-white/30 bg-white/70 px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)] shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                    Status-only
                  </span>
                </div>
                <div className="space-y-2 text-sm text-[var(--text-primary)]">
                  {app.notes.map((note) => (
                    <div key={note} className="flex items-start gap-2 rounded-2xl border border-white/30 bg-white/70 px-3 py-2 text-[13px] leading-relaxed shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                      <span className="mt-0.5 inline-block h-2 w-2 rounded-full bg-[var(--ryuzen-azure)]" aria-hidden />
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
