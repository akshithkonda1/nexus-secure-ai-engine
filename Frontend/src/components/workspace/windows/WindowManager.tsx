/**
 * Window Manager Component
 * Orchestrates all floating windows
 */

import { lazy, Suspense } from 'react';
import { ListChecks, CheckSquare2, Calendar, Link } from 'lucide-react';
import { Window } from './Window';
import { useWindowManager } from '../../../hooks/useWindowManager';
import type { WindowType } from '../../../types/workspace';

// Lazy load window content for performance
const ListsContent = lazy(() => import('../content/ListsContent'));
const TasksContent = lazy(() => import('../content/TasksContent'));
const CalendarContent = lazy(() => import('../content/CalendarContent'));
const ConnectorsContent = lazy(() => import('../content/ConnectorsContent'));

// Window skeleton for loading state
function WindowSkeleton() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-pulse rounded-xl bg-[var(--bg-elev)]" />
        <div className="h-4 w-32 animate-pulse rounded bg-[var(--bg-elev)]" />
      </div>
    </div>
  );
}

// Icon mapping for window types
const iconMap: Record<WindowType, typeof ListChecks> = {
  lists: ListChecks,
  tasks: CheckSquare2,
  calendar: Calendar,
  connectors: Link,
  custom: ListChecks, // fallback
};

// Title mapping
const titleMap: Record<WindowType, string> = {
  lists: 'Lists',
  tasks: 'Tasks',
  calendar: 'Calendar',
  connectors: 'Connectors',
  custom: 'Custom',
};

// Content component mapping
const contentMap: Record<WindowType, typeof ListsContent> = {
  lists: ListsContent,
  tasks: TasksContent,
  calendar: CalendarContent,
  connectors: ConnectorsContent,
  custom: ListsContent, // fallback
};

export default function WindowManager() {
  const {
    windows,
    closeWindow,
    updateWindow,
    focusWindow,
    minimizeWindow,
    maximizeWindow,
  } = useWindowManager();

  return (
    <div className="pointer-events-none fixed inset-0 z-20">
      {windows.map((window) => {
        if (!window.isOpen) return null;

        const Icon = iconMap[window.type];
        const title = titleMap[window.type];
        const ContentComponent = contentMap[window.type];

        return (
          <div key={window.id} className="pointer-events-auto">
            <Window
              id={window.id}
              title={title}
              icon={Icon}
              position={window.position}
              size={window.size}
              zIndex={window.zIndex}
              isMinimized={window.isMinimized}
              isMaximized={window.isMaximized}
              isPinned={window.isPinned}
              canDrag={window.canDrag}
              canResize={window.canResize}
              canClose={window.canClose}
              onClose={() => closeWindow(window.id)}
              onDrag={(position) => updateWindow(window.id, { position })}
              onResize={(size) => updateWindow(window.id, { size })}
              onFocus={() => focusWindow(window.id)}
              onMinimize={() => minimizeWindow(window.id)}
              onMaximize={() => maximizeWindow(window.id)}
              suggestionCount={0} // TODO: Connect to suggestions
            >
              <Suspense fallback={<WindowSkeleton />}>
                <ContentComponent />
              </Suspense>
            </Window>
          </div>
        );
      })}
    </div>
  );
}
