import { useState } from 'react';
import { cn } from '../../utils/theme';
import ChatsView from './ChatsView';
import ProjectsView from './ProjectsView';

type View = 'chats' | 'projects';

export default function ToronRail() {
  const [activeView, setActiveView] = useState<View>('chats');

  return (
    <div className="flex h-full flex-col">
      {/* Header with toggle buttons */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--line-subtle)] bg-[var(--layer-surface)] px-4 py-3">
        {/* Toggle Buttons Container */}
        <div className="flex flex-1 gap-1 rounded-lg bg-[var(--bg-elev)] p-1">
          <button
            onClick={() => setActiveView('chats')}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all',
              activeView === 'chats'
                ? 'bg-[var(--layer-surface)] font-semibold text-[var(--text)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveView('projects')}
            className={cn(
              'flex-1 rounded-md px-3 py-1.5 text-[13px] font-medium transition-all',
              activeView === 'projects'
                ? 'bg-[var(--layer-surface)] font-semibold text-[var(--text)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            )}
          >
            Projects
          </button>
        </div>

        {/* New Button */}
        <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white transition-transform hover:scale-105 active:scale-95">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeView === 'chats' ? <ChatsView /> : <ProjectsView />}
      </div>
    </div>
  );
}
