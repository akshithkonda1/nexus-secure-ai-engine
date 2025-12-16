import { useMemo, useState } from "react";
import {
  ListChecks,
  CalendarClock,
  CheckSquare2,
  PlugZap,
  Bot,
  BookOpen,
  NotepadText,
  Kanban,
  Workflow,
  Activity,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import Quadrants from "../components/workspace/Quadrants";
import WorkspaceSurface from "../components/workspace/WorkspaceSurface";

const quadrantItems = [
  {
    id: "lists",
    title: "Lists",
    description: "Outline ideas, capture research, and stage resources for Toron.",
    metric: "12 active",
    indicator: "Intentions",
    icon: ListChecks,
    accent: "from-[var(--ryuzen-dodger)] to-[var(--ryuzen-azure)]",
  },
  {
    id: "calendar",
    title: "Calendar",
    description: "Sync events across Google, Apple, and Microsoft with conflict guards.",
    metric: "3 sources",
    indicator: "Time",
    icon: CalendarClock,
    accent: "from-[var(--ryuzen-azure)] to-[var(--ryuzen-purple)]",
  },
  {
    id: "tasks",
    title: "Tasks",
    description: "Convert Toron suggestions into next actions with owners and due dates.",
    metric: "18 ready",
    indicator: "Actions",
    icon: CheckSquare2,
    accent: "from-[var(--ryuzen-purple)] to-[var(--ryuzen-dodger)]",
  },
  {
    id: "connectors",
    title: "Connectors",
    description: "Secure integrations for Notion, Canvas, Meta, and enterprise drives.",
    metric: "6 linked",
    indicator: "Systems",
    icon: PlugZap,
    accent: "from-[var(--ryuzen-azure)] to-[var(--ryuzen-purple)]",
  },
];

const workspaceViews = [
  {
    id: "pages",
    label: "Pages",
    description: "Project briefs and meeting narratives",
    hotkey: "P",
    icon: BookOpen,
    summary: "Pages curated for this workspace",
    items: [
      { title: "Launch readiness", meta: "Ops playbook • Edited 2h ago", status: "Toron highlights applied", link: "#" },
      { title: "Market scan", meta: "Research deck • 14 insights", status: "ALOE summarization enabled", link: "#" },
      { title: "Customer stories", meta: "Case notes • Updated daily", status: "Pinned for exec briefing" },
      { title: "Release PRD", meta: "Product spec • v1.4", status: "Awaiting stakeholder sign-off" },
    ],
    actions: ["Generate summary", "Share to workspace", "Send to Toron"],
  },
  {
    id: "notes",
    label: "Notes",
    description: "Rapid scratchpad synced to Toron",
    hotkey: "N",
    icon: NotepadText,
    summary: "Pinned notes in this workspace",
    items: [
      { title: "ALOE prompts", meta: "Prompt set • curated", status: "Ready for reuse" },
      { title: "Risk register", meta: "Live note • 8 open items", status: "Toron watching" },
      { title: "Retro takeaways", meta: "Team huddle • 10 bullets", status: "Sharing with stakeholders" },
      { title: "Open questions", meta: "Workspace thread", status: "3 awaiting owners" },
    ],
    actions: ["Link to tasks", "Mark for Toron follow-up"],
  },
  {
    id: "boards",
    label: "Boards",
    description: "Kanban and swimlanes",
    hotkey: "B",
    icon: Kanban,
    summary: "Execution boards and swimlanes",
    items: [
      { title: "Delivery tracker", meta: "12 cards • 3 columns", status: "Next review at 4pm" },
      { title: "Risk mitigations", meta: "Swimlane • 5 owners", status: "Blocked items flagged" },
      { title: "Design QA", meta: "Board • 7 checks", status: "QA cycle in progress" },
      { title: "Enablement", meta: "Board • 9 assets", status: "ALOE automation ready" },
    ],
    actions: ["Assign in bulk", "Sync to calendar"],
  },
  {
    id: "flows",
    label: "Flows",
    description: "Automations and playbooks",
    hotkey: "F",
    icon: Workflow,
    summary: "Automation flows ready to run",
    items: [
      { title: "On-call update", meta: "Status → Slack + email", status: "Scheduled nightly" },
      { title: "Inbox triage", meta: "Gmail + Tasks", status: "Rules refreshed by Toron" },
      { title: "Daily brief", meta: "Calendar + Notes", status: "Delivered 7:30am" },
      { title: "Connector checks", meta: "Systems health", status: "All connectors stable" },
    ],
    actions: ["Run now", "Clone flow", "Send to Toron"],
  },
  {
    id: "toron",
    label: "Toron",
    description: "Embedded co-pilot",
    hotkey: "T",
    icon: Bot,
    summary: "Toron watching this workspace",
    items: [
      { title: "Signal routing", meta: "Priorities recalibrated", status: "Live" },
      { title: "Memory index", meta: "18 threads cached", status: "Ready for recall" },
      { title: "Safety envelope", meta: "Strict logging + redactions", status: "Active" },
      { title: "Insights", meta: "3 suggestions queued", status: "Push to inbox" },
    ],
    actions: ["Open conversation", "Review summaries"],
  },
];

export default function WorkspacePage() {
  const [activeView, setActiveView] = useState(workspaceViews[0].id);

  const postureCards = useMemo(
    () => [
      {
        title: "Workspace health",
        value: "Steady",
        detail: "Signals routed, connectors stable",
        icon: ShieldCheck,
      },
      {
        title: "Momentum",
        value: "+18%",
        detail: "Velocity over last 7 days",
        icon: Activity,
      },
      {
        title: "Insights",
        value: "6 new",
        detail: "Toron observations since yesterday",
        icon: Bot,
      },
      {
        title: "Focus",
        value: "Launch window",
        detail: "Tasks and calendars aligned",
        icon: BarChart3,
      },
    ],
    [],
  );

  return (
    <section className="flex flex-col gap-10">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-[var(--text-strong)] shadow-[0_10px_40px_rgba(15,23,42,0.12)] backdrop-blur-md dark:border-white/10 dark:bg-white/5">
          <span className="flex h-2 w-2 rounded-full bg-[var(--ryuzen-azure)]" aria-hidden />
          Workspace OS — organized areas for ongoing work
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold leading-tight text-[var(--text-strong)]">Operate in quadrants, ship with Toron</h1>
          <p className="max-w-3xl text-base leading-relaxed text-[var(--text-muted)]">
            Intentions, time, actions, and systems stay synchronized. Choose a view to bring Pages, Notes, Boards, Flows, or Toron to the center surface.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {postureCards.map((card) => (
          <div
            key={card.title}
            className="group relative flex min-h-[170px] flex-col justify-between rounded-3xl border border-white/15 bg-white/60 px-4 py-4 shadow-[0_20px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl transition-colors dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/70 text-[var(--text-primary)] ring-1 ring-white/30 shadow-inner dark:bg-white/10 dark:ring-white/10">
                <card.icon className="h-5 w-5" />
              </div>
              <span className="rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold text-[var(--text-muted)] shadow-sm backdrop-blur-sm dark:border-white/10">{card.title}</span>
            </div>
            <div className="space-y-1.5 pt-3">
              <p className="text-2xl font-semibold text-[var(--text-strong)]">{card.value}</p>
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">{card.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-5">
          <Quadrants items={quadrantItems} />
          <div className="rounded-3xl border border-white/15 bg-white/50 p-6 text-sm text-[var(--text-muted)] shadow-[0_18px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">Structure</p>
                <p className="text-lg font-semibold text-[var(--text-strong)]">Quadrants + OS Bar</p>
              </div>
              <div className="rounded-full border border-white/20 bg-white/60 px-3 py-1 text-[11px] font-semibold text-[var(--text-strong)] shadow-inner backdrop-blur-sm dark:border-white/10 dark:bg-white/10">
                Real-time
              </div>
            </div>
            <p className="mt-4 max-w-2xl leading-relaxed">
              Arrange modules as needed. Slide between quadrants, pin your OS Bar view, and let Toron watch for collisions across tasks, calendars, and connectors.
            </p>
          </div>
        </div>

        <WorkspaceSurface
          views={workspaceViews}
          activeId={activeView}
          onSelect={setActiveView}
        />
      </div>
    </section>
  );
}
