import React, { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
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
import ThemeToggle from "@/components/core/ThemeToggle";
import WidgetExpansionModal from "@/components/widgets/WidgetExpansionModal";
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
  | "notifications"
  | "workspace-home";

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
  const [activePanel, setActivePanel] = useState<PanelKey>("workspace-home");
  const [lists, setLists] = useState<WorkspaceList[]>(initialLists);
  const [events, setEvents] = useState(initialEvents);
  const [connectors, setConnectors] = useState<WorkspaceConnector[]>(initialConnectors);
  const [schedule, setSchedule] = useState<WorkspaceSchedule[]>(initialSchedule);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const saved = localStorage.getItem("ryuzen-last-panel");
    if (saved) {
      setActivePanel(saved as PanelKey);
    }
  }, []);

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
    openPanel("calendar");
    broadcastToron({ calendar: day.toISOString() });
  };

  const openPanel = (panel: PanelKey) => {
    setActivePanel(panel);
    localStorage.setItem("ryuzen-last-panel", panel);
    if (panel === "toron") {
      broadcastToron({ lists, events, connectors, schedule });
    }
  };

  const isCanvasMode = useMemo(
    () => ["pages", "notes", "boards", "flows"].includes(activePanel),
    [activePanel],
  );

  const modalPanel = useMemo(() => {
    switch (activePanel) {
      case "lists":
        return <ListsPanel lists={lists} onChange={handleListChange} close={() => openPanel("workspace-home")} />;
      case "calendar":
        return (
          <CalendarPanel
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            close={() => openPanel("workspace-home")}
          />
        );
      case "connectors":
        return <ConnectorsPanel connectors={connectors} onChange={handleConnectorChange} close={() => openPanel("workspace-home")} />;
      case "tasks":
        return <TasksPanel schedule={schedule} onChange={handleScheduleChange} close={() => openPanel("workspace-home")} />;
      case "toron":
        return (
          <ToronPromptPanel
            lists={lists}
            events={events}
            connectors={connectors}
            schedule={schedule}
            close={() => openPanel("workspace-home")}
          />
        );
      case "notifications":
        return <NotificationsPanel open={true} onClose={() => openPanel("workspace-home")} />;
      default:
        return null;
    }
  }, [activePanel, connectors, events, handleConnectorChange, handleListChange, handleScheduleChange, lists, openPanel, schedule, selectedDate]);

  const canvasPanel = useMemo(() => {
    switch (activePanel) {
      case "pages":
        return <PagesPanel close={() => openPanel("workspace-home")} />;
      case "notes":
        return <NotesPanel close={() => openPanel("workspace-home")} />;
      case "boards":
        return <BoardsPanel close={() => openPanel("workspace-home")} />;
      case "flows":
        return <FlowsPanel close={() => openPanel("workspace-home")} />;
      case "workspace-home":
      default:
        return (
          <div className="mt-16 text-center text-textSecondary dark:text-textMuted">
            <h2 className="text-2xl font-semibold text-textPrimary dark:text-textMuted">Workspace Ready</h2>
            <p>Pages, notes, boards, and flows stay inside this canvas.</p>
          </div>
        );
    }
  }, [activePanel, openPanel]);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] transition-all">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-32 pt-10 lg:px-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[var(--text-secondary)]">Ryuzen</p>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Workspace OS</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--border-card)] bg-[var(--bg-widget)] text-[var(--text-primary)] shadow-[0_4px_18px_rgba(0,0,0,0.1)] backdrop-blur-xl transition hover:scale-105 hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              onClick={() => openPanel("notifications")}
            >
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-8 grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-1">
            <ListsWidget data={lists} onChange={handleListChange} onExpand={() => openPanel("lists")} />
          </div>
          <div className="xl:col-span-1 xl:col-start-4">
            <CalendarWidget events={events} selectedDate={selectedDate} onSelectDate={handleDayOpen} />
          </div>
          <div className="xl:col-span-2 xl:col-start-2 xl:row-span-3">
            <WorkspaceCanvas
              active={isCanvasMode}
              onClose={() => openPanel("workspace-home")}
            >
              {canvasPanel}
            </WorkspaceCanvas>
          </div>
          <div className="xl:col-span-1 xl:row-start-3">
            <ConnectorsWidget connectors={connectors} onChange={handleConnectorChange} onExpand={() => openPanel("connectors")} />
          </div>
          <div className="xl:col-span-1 xl:col-start-4 xl:row-start-3">
            <TasksWidget schedule={schedule} onChange={handleScheduleChange} onExpand={() => openPanel("tasks")} />
          </div>
        </div>
      </div>

      <LiquidOSBar active={activePanel} openPanel={openPanel} />
      <WidgetExpansionModal
        open={!isCanvasMode && !!modalPanel}
        title={
          activePanel === "lists"
            ? "Lists"
            : activePanel === "calendar"
              ? "Calendar"
              : activePanel === "connectors"
                ? "Connectors"
                : activePanel === "tasks"
                  ? "Tasks"
                  : activePanel === "toron"
                    ? "Toron AI"
                    : "Notifications"
        }
        onClose={() => openPanel("workspace-home")}
      >
        {modalPanel}
      </WidgetExpansionModal>
    </div>
  );
};

export default RyuzenWorkspace;
