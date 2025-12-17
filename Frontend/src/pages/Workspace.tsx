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

const hierarchy = {
  connectors: {
    container: "w-[320px] gap-3", // lightest presence
    headerText: "text-sm font-semibold text-[var(--text-primary)]",
    focusText: "text-[11px] text-[var(--text-muted)]",
    noteText: "text-[13px] text-[var(--text-muted)]",
  },
  lists: {
    container: "w-[340px] gap-3",
    headerText: "text-sm font-semibold text-[var(--text-primary)]",
    focusText: "text-[12px] text-[var(--text-muted)]",
    noteText: "text-[13px] text-[var(--text-muted)]",
  },
  tasks: {
    container: "w-[360px] gap-4",
    headerText: "text-base font-semibold text-[var(--text-primary)]",
    focusText: "text-[12px] text-[var(--text-muted)]",
    noteText: "text-[13px] text-[var(--text-primary)]",
  },
  calendar: {
    container: "w-[380px] gap-5",
    headerText: "text-lg font-semibold text-[var(--text-primary)]",
    focusText: "text-[13px] text-[var(--text-muted)]",
    noteText: "text-[14px] text-[var(--text-primary)]",
  },
};

export default function WorkspacePage() {
  const [activeInterface, setActiveInterface] = useState(interfaceBar[0].id);

  return (
    <section className="relative">
      <div className="relative min-h-[960px] overflow-hidden rounded-[48px] border border-white/10 bg-gradient-to-b from-[#eaf1fb] via-[#dfe5f3] to-[#0c1838] p-10 shadow-[0_18px_70px_rgba(12,25,64,0.12)] dark:border-white/10 dark:from-white/10 dark:via-white/5 dark:to-slate-900">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,12,28,0.18),transparent_52%)]" />
        <div className="relative flex h-full flex-col">
          <div className="relative flex-1">
            <div className="absolute inset-0 flex items-center justify-center px-24">
              <WorkspaceSurface items={interfaceBar} activeId={activeInterface} onSelect={setActiveInterface} />
            </div>

            {cornerApps.map((app) => (
              <div
                key={app.id}
                className={`absolute ${placement[app.id as keyof typeof placement]} ${hierarchy[app.id as keyof typeof hierarchy].container} max-w-full space-y-3 rounded-[30px] border border-white/10 bg-gradient-to-b from-white/55 to-white/38 p-5 shadow-[0_10px_28px_rgba(10,24,56,0.1)] backdrop-blur-sm dark:border-white/10 dark:from-white/10 dark:to-white/5`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[var(--text-strong)]">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/55 text-[var(--text-muted)] ring-1 ring-white/25 shadow-inner dark:bg-white/10 dark:ring-white/10">
                      <app.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className={`${hierarchy[app.id as keyof typeof hierarchy].headerText} tracking-tight`}>{app.title}</p>
                      <p className={`${hierarchy[app.id as keyof typeof hierarchy].focusText}`}>{app.focus}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-[var(--text-muted)]">
                  {app.notes.map((note) => (
                    <div key={note} className="flex items-start gap-3 rounded-2xl border border-white/15 bg-white/45 px-4 py-3 text-[13px] leading-relaxed shadow-inner backdrop-blur-[2px] dark:border-white/10 dark:bg-white/5">
                      <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-[#8f9ab5]" aria-hidden />
                      <span className={`${hierarchy[app.id as keyof typeof hierarchy].noteText}`}>{note}</span>
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
