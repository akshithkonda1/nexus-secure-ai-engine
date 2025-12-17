import { useState } from "react";
import { Activity, BookOpen, CalendarClock, CheckSquare2, Kanban, ListChecks, NotepadText, PlugZap, Workflow } from "lucide-react";
import WorkspaceSurface from "../components/workspace/WorkspaceSurface";

const cornerApps = [
  {
    id: "lists",
    title: "Lists",
    focus: "Semantic shelves",
    icon: ListChecks,
    notes: ["Themes grouped by intent", "Steady cadence, no rush", "Safe to pause anytime"],
  },
  {
    id: "calendar",
    title: "Calendar",
    focus: "Time authority",
    icon: CalendarClock,
    notes: ["Day schedule synced", "Time guardrails active", "Tasks on hold by time"],
  },
  {
    id: "connectors",
    title: "Connectors",
    focus: "Ecosystems linked",
    icon: PlugZap,
    notes: ["All endpoints authenticated", "Sync intervals relaxed", "No alerts raised"],
  },
  {
    id: "tasks",
    title: "Tasks",
    focus: "Short horizon tasks",
    icon: CheckSquare2,
    notes: ["Owners visible, not urgent", "Time checks ready", "Snoozes allowed"],
  },
];

const interfaceBar = [
  { id: "pages", label: "Pages", description: "Project narratives", hotkey: "P", icon: BookOpen },
  { id: "notes", label: "Notes", description: "Lightweight scratchpads", hotkey: "N", icon: NotepadText },
  { id: "boards", label: "Boards", description: "Simple lanes", hotkey: "B", icon: Kanban },
  { id: "flows", label: "Flows", description: "Calm automations", hotkey: "F", icon: Workflow },
  { id: "toron", label: "Analyze with Toron", description: "Call overlays as needed", hotkey: "A", icon: Activity },
];

const cornerOffsets = {
  top: "clamp(1.5rem, 3vw, 3.5rem)",
  bottom: "clamp(2rem, 4vw, 4.25rem)",
  side: "clamp(1.75rem, 3vw, 4rem)",
};

const placement = {
  lists: { top: cornerOffsets.top, left: cornerOffsets.side },
  calendar: { top: cornerOffsets.top, right: cornerOffsets.side },
  connectors: { bottom: cornerOffsets.bottom, left: cornerOffsets.side },
  tasks: { bottom: cornerOffsets.bottom, right: cornerOffsets.side },
};

const hierarchy = {
  connectors: {
    container: "gap-3",
    width: "clamp(18rem, 23vw, 22rem)",
    headerText: "text-sm font-semibold text-[var(--text-primary)]",
    focusText: "text-[11px] text-[var(--text-muted)]",
    noteText: "text-[13px] text-[var(--text-muted)]",
  },
  lists: {
    container: "gap-3",
    width: "clamp(18.5rem, 24vw, 23rem)",
    headerText: "text-sm font-semibold text-[var(--text-primary)]",
    focusText: "text-[12px] text-[var(--text-muted)]",
    noteText: "text-[13px] text-[var(--text-muted)]",
  },
  tasks: {
    container: "gap-4",
    width: "clamp(19rem, 25vw, 23.5rem)",
    headerText: "text-base font-semibold text-[var(--text-primary)]",
    focusText: "text-[12px] text-[var(--text-muted)]",
    noteText: "text-[13px] text-[var(--text-primary)]",
  },
  calendar: {
    container: "gap-5",
    width: "clamp(19.5rem, 26vw, 24rem)",
    headerText: "text-lg font-semibold text-[var(--text-primary)]",
    focusText: "text-[13px] text-[var(--text-muted)]",
    noteText: "text-[14px] text-[var(--text-primary)]",
  },
};

export default function WorkspacePage() {
  const [activeInterface, setActiveInterface] = useState(interfaceBar[0].id);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,12,28,0.16),transparent_54%)]" />
      <div className="relative flex h-full w-full items-center justify-center px-[clamp(1.5rem,3vw,3.5rem)] py-[clamp(1.5rem,3vw,3.5rem)]">
        <div className="relative z-10 flex h-full w-full items-center justify-center">
          <WorkspaceSurface items={interfaceBar} activeId={activeInterface} onSelect={setActiveInterface} />
        </div>
        {cornerApps.map((app) => (
          <div
            key={app.id}
            className={`pointer-events-auto absolute ${hierarchy[app.id as keyof typeof hierarchy].container} max-w-full space-y-3 rounded-[30px] border border-white/10 bg-gradient-to-b from-white/55 to-white/38 p-5 shadow-[0_10px_28px_rgba(10,24,56,0.1)] backdrop-blur-sm dark:border-white/10 dark:from-white/10 dark:to-white/5`}
            style={{
              top: placement[app.id as keyof typeof placement].top,
              right: placement[app.id as keyof typeof placement].right,
              bottom: placement[app.id as keyof typeof placement].bottom,
              left: placement[app.id as keyof typeof placement].left,
              width: hierarchy[app.id as keyof typeof hierarchy].width,
            }}
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
  );
}
