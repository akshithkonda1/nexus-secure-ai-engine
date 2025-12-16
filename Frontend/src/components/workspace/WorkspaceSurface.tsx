import { ElementType, useMemo } from "react";
import { Activity, BookOpen, Kanban, NotepadText, Workflow, Bot } from "lucide-react";
import OSBar, { OSBarItem } from "./osbar/OSBar";
import DynamicWorkspace from "./center/DynamicWorkspace";

type WorkspaceSurfaceProps = {
  views: Array<
    OSBarItem & {
      summary: string;
      items: { title: string; meta: string; status: string; link?: string }[];
      actions?: string[];
    }
  >;
  activeId: string;
  onSelect: (id: string) => void;
};

const iconMap: Record<string, ElementType> = {
  pages: BookOpen,
  notes: NotepadText,
  boards: Kanban,
  flows: Workflow,
  toron: Bot,
  default: Activity,
};

export default function WorkspaceSurface({ views, activeId, onSelect }: WorkspaceSurfaceProps) {
  const activeView = useMemo(() => views.find((view) => view.id === activeId) ?? views[0], [activeId, views]);
  const osbarItems: OSBarItem[] = useMemo(
    () =>
      views.map((view) => ({
        id: view.id,
        label: view.label,
        description: view.description,
        hotkey: view.hotkey,
        icon: view.icon ?? iconMap[view.id] ?? iconMap.default,
      })),
    [views],
  );

  return (
    <div className="space-y-4">
      <OSBar items={osbarItems} activeId={activeId} onSelect={onSelect} />
      {activeView && <DynamicWorkspace view={activeView} />}
    </div>
  );
}
