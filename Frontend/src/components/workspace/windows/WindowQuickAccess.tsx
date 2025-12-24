/**
 * Window Quick Access Component
 * Floating toolbar for opening windows
 */

import { ListChecks, CheckSquare2, Calendar, Link } from 'lucide-react';
import { useWindowManager } from '../../../hooks/useWindowManager';
import type { WindowType } from '../../../types/workspace';

const windowTypes: { type: WindowType; icon: typeof ListChecks; label: string }[] = [
  { type: 'lists', icon: ListChecks, label: 'Lists' },
  { type: 'tasks', icon: CheckSquare2, label: 'Tasks' },
  { type: 'calendar', icon: Calendar, label: 'Calendar' },
  { type: 'connectors', icon: Link, label: 'Connectors' },
];

export default function WindowQuickAccess() {
  const { openWindow, closeWindow, getWindowsByType } = useWindowManager();

  const handleToggleWindow = (type: WindowType) => {
    const existingWindows = getWindowsByType(type);

    if (existingWindows.length > 0) {
      // Close all windows of this type
      existingWindows.forEach(w => closeWindow(w.id));
    } else {
      // Open new window
      openWindow(type);
    }
  };

  return (
    <div className="fixed right-6 top-6 z-20 flex gap-2 rounded-2xl border border-[var(--line-subtle)]/40 bg-[var(--bg-surface)]/85 p-2 shadow-xl backdrop-blur-xl">
      {windowTypes.map(({ type, icon: Icon, label }) => {
        const existingWindows = getWindowsByType(type);
        const isOpen = existingWindows.length > 0;

        return (
          <button
            key={type}
            type="button"
            onClick={() => handleToggleWindow(type)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
              isOpen
                ? 'bg-[var(--accent)] text-white shadow-lg ring-1 ring-[var(--accent)]/50'
                : 'bg-[var(--bg-elev)] text-[var(--muted)] hover:bg-[var(--accent)]/20 hover:text-[var(--accent)]'
            }`}
            aria-label={`Toggle ${label} window`}
            title={`${isOpen ? 'Close' : 'Open'} ${label}`}
          >
            <Icon className="h-5 w-5" />
          </button>
        );
      })}
    </div>
  );
}
