import React, { useMemo, useState } from "react";
import { Bell, User } from "lucide-react";
import ListsWidget from "@/components/widgets/ListsWidget";
import CalendarWidget from "@/components/widgets/CalendarWidget";
import ConnectorsWidget from "@/components/widgets/ConnectorsWidget";
import TasksWidget from "@/components/widgets/TasksWidget";
import WorkspaceCanvas from "@/components/core/WorkspaceCanvas";
import LiquidOSBar from "@/components/core/LiquidOSBar";
import NotificationsPanel from "@/components/core/NotificationsPanel";
import ListsPanel from "@/components/panels/ListsPanel";
import CalendarPanel from "@/components/panels/CalendarPanel";
import ConnectorsPanel from "@/components/panels/ConnectorsPanel";
import TasksPanel from "@/components/panels/TasksPanel";
import PagesPanel from "@/components/panels/PagesPanel";
import NotesPanel from "@/components/panels/NotesPanel";
import BoardsPanel from "@/components/panels/BoardsPanel";
import FlowsPanel from "@/components/panels/FlowsPanel";
import ToronPromptPanel from "@/components/panels/ToronPromptPanel";
import ProfilePanel from "@/components/panels/ProfilePanel";
import ThemeToggle from "@/components/core/ThemeToggle";
import { WorkspaceConnector, WorkspaceList, WorkspaceSchedule } from "@/types/workspace";

export type PanelKey =
  | "lists"
  | "calendar"
  | "connectors"
  | "tasks"
  | "pages"
  | "notes"
  | "boards"
  | "flows"
  | "toron"
  | "profile"
  | "notifications"
  | null;

const initialLists: WorkspaceList[] = [
  {
    id: "list-1",
    title: "Strategic Signals",
    items: [
      { id: "l1", text: "Map research sprints", done: false },
      { id: "l2", text: "Prep Toron insights", done: true },
      { id: "l3", text: "Sync lab connectors", done: false },
    ],
  },
  {
    id: "list-2",
    title: "Labs + Studios",
    items: [
      { id: "l4", text: "Canvas drop + alignment", done: false },
      { id: "l5", text: "Meta co-lab brief", done: false },
    ],
  },
];

const initialEvents = [
  { date: "2024-09-02", type: "urgent", title: "Ship Ryuzens" },
  { date: "2024-09-05", type: "meeting", title: "Product tower sync" },
  { date: "2024-09-08", type: "event", title: "Beta drop" },
  { date: "2024-09-12", type: "multi", title: "Studio jam" },
  { date: "2024-09-15", type: "meeting", title: "Investor check-in" },
];

const initialConnectors: WorkspaceConnector[] = [
  { id: "g", name: "Google", status: "connected", lastSync: "2m ago" },
  { id: "m", name: "Microsoft", status: "warning", lastSync: "18m ago" },
  { id: "a", name: "Apple", status: "connected", lastSync: "5m ago" },
  { id: "meta", name: "Meta", status: "error", lastSync: "52m ago" },
  { id: "canvas", name: "Canvas", status: "connected", lastSync: "12m ago" },
  { id: "notion", name: "Notion", status: "connected", lastSync: "9m ago" },
];

const initialSchedule: WorkspaceSchedule[] = [
  {
    hour: "08:00",
    focus: "Priorities",
    items: [
      { id: "t1", title: "Inbox zero + intents", source: "Lists" },
      { id: "t2", title: "Calendar triage", source: "Calendar" },
    ],
  },
  {
    hour: "10:00",
    focus: "Studios",
    items: [
      { id: "t3", title: "Canvas live demo", source: "Connectors" },
      { id: "t4", title: "Meta infra notes", source: "Lists" },
    ],
  },
  {
    hour: "13:00",
    focus: "Deep work",
    items: [
      { id: "t5", title: "Design floating nodes", source: "Boards" },
    ],
  },
];

const RyuzenWorkspace: React.FC = () => {
  const [activePanel, setActivePanel] = useState<PanelKey>(null);
  const [lists, setLists] = useState<WorkspaceList[]>(initialLists);
  const [events, setEvents] = useState(initialEvents);
  const [connectors, setConnectors] = useState<WorkspaceConnector[]>(initialConnectors);
  const [schedule, setSchedule] = useState<WorkspaceSchedule[]>(initialSchedule);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const broadcastToron = (payload: Record<string, unknown>) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("toron-signal", { detail: payload }));
  };

  const handleListChange = (next: WorkspaceList[]) => {
    setLists(next);
    broadcastToron({ lists: next });
  };

  const handleScheduleChange = (next: WorkspaceSchedule[]) => {
    setSchedule(next);
    broadcastToron({ tasks: next });
  };

  const handleConnectorChange = (next: WorkspaceConnector[]) => {
    setConnectors(next);
    broadcastToron({ connectors: next });
  };

  const handleDayOpen = (day: Date) => {
    setSelectedDate(day);
    setActivePanel("calendar");
    broadcastToron({ calendar: day.toISOString() });
  };

  const openPanel = (panel: PanelKey) => {
    setActivePanel(panel);
    if (panel === "toron") {
      broadcastToron({ lists, events, connectors, schedule });
    }
  };

  const renderPanel = useMemo(() => {
    switch (activePanel) {
      case "lists":
        return <ListsPanel lists={lists} onChange={handleListChange} />;
      case "calendar":
        return <CalendarPanel events={events} selectedDate={selectedDate} onSelectDate={setSelectedDate} />;
      case "connectors":
        return <ConnectorsPanel connectors={connectors} onChange={handleConnectorChange} />;
      case "tasks":
        return <TasksPanel schedule={schedule} onChange={handleScheduleChange} />;
      case "pages":
        return <PagesPanel />;
      case "notes":
        return <NotesPanel />;
      case "boards":
        return <BoardsPanel />;
      case "flows":
        return <FlowsPanel />;
      case "toron":
        return <ToronPromptPanel lists={lists} events={events} connectors={connectors} schedule={schedule} />;
      case "notifications":
        return <NotificationsPanel open={true} onClose={() => setActivePanel(null)} />;
      case "profile":
        return <ProfilePanel />;
      default:
        return null;
    }
  }, [activePanel, connectors, events, lists, schedule, selectedDate]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 text-black/80 dark:from-[#0f1117] dark:via-[#0c0f1a] dark:to-[#101421] dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(88,118,255,0.12),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(120,67,233,0.12),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.08),transparent_30%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(88,118,255,0.12),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(120,67,233,0.12),transparent_32%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.12),transparent_30%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-32 pt-10 lg:px-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-black/60 dark:text-white/60">Ryuzen</p>
            <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-white">Workspace OS</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-black/5 text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-xl transition hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:border-white/10 dark:bg-white/10 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
              onClick={() => openPanel("notifications")}
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-gradient-to-br from-black/10 via-black/5 to-transparent text-black/80 shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-xl transition hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] dark:border-white/10 dark:bg-gradient-to-br dark:from-white/20 dark:via-white/10 dark:to-white/5 dark:text-white/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
              onClick={() => openPanel("profile")}
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-8 grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-1">
            <ListsWidget data={lists} onChange={handleListChange} onExpand={() => setActivePanel("lists")} />
          </div>
          <div className="xl:col-span-1 xl:col-start-4">
            <CalendarWidget events={events} selectedDate={selectedDate} onSelectDate={handleDayOpen} />
          </div>
          <div className="xl:col-span-2 xl:col-start-2 xl:row-span-3">
            <WorkspaceCanvas active={!!renderPanel} onClose={() => setActivePanel(null)}>
              {renderPanel}
            </WorkspaceCanvas>
          </div>
          <div className="xl:col-span-1 xl:row-start-3">
            <ConnectorsWidget connectors={connectors} onChange={handleConnectorChange} onExpand={() => setActivePanel("connectors")} />
          </div>
          <div className="xl:col-span-1 xl:col-start-4 xl:row-start-3">
            <TasksWidget schedule={schedule} onChange={handleScheduleChange} onExpand={() => setActivePanel("tasks")} />
          </div>
        </div>
      </div>

      <LiquidOSBar active={activePanel} openPanel={openPanel} />
    </div>
  );
};

export default RyuzenWorkspace;
