import { 
  Calendar, 
  Link2,
  Clock,
  CheckSquare
} from 'lucide-react';
import { cn } from '../utils/theme';

export default function Workspace() {
  return (
    <div className="h-full overflow-hidden bg-[#0f1419] text-white">
      {/* Workspace Container */}
      <div className="mx-auto flex h-full">
        {/* Left Sidebar - Always Visible */}
        <aside 
          className="relative flex flex-col border-r border-slate-800 bg-[#0d1117]"
          style={{ 
            width: 280,
            minWidth: 280,
            flexShrink: 0,
          }}
        >
          <div className="flex-1 overflow-y-auto p-4">
            {/* Lists Section */}
            <div className="mb-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span className="font-medium">Lists</span>
                  <span className="text-xs">Semantic shelves</span>
                </div>
                <button className="rounded p-1 hover:bg-slate-800">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-1">
                <ListItem name="Research" count={12} active />
                <ListItem name="Delivery" count={8} />
                <ListItem name="Backlog" count={19} />
              </div>
              
              <div className="mt-2 text-xs text-slate-500">
                Selected list: Research
              </div>
            </div>
            
            {/* Connectors Section */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                <Link2 className="h-4 w-4" />
                <span className="font-medium">Connectors</span>
                <span className="text-xs">Ecosystems linked</span>
              </div>
              
              <div className="space-y-2">
                <ConnectorItem name="GitHub" status="Healthy" color="blue" />
                <ConnectorItem name="Notion" status="Idle" color="gray" />
                <ConnectorItem name="Linear" status="Listening" color="blue" />
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Canvas - Focus Surface */}
        <main className="flex flex-1 flex-col bg-[#0f1419]">
          {/* Canvas Header */}
          <div className="border-b border-slate-800 px-8 py-6">
            <div className="mb-2 text-sm text-slate-400">FOCUS SURFACE</div>
            <h1 className="mb-2 text-4xl font-bold">Pages</h1>
            <p className="text-slate-400">Narratives, blueprints, and full context.</p>
          </div>
          
          {/* Canvas Content - Empty State */}
          <div className="flex flex-1 items-center justify-center">
            <div className="max-w-lg text-center">
              <div className="mb-4 flex justify-center">
                <svg className="h-12 w-12 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold">Center is clear</h2>
              <p className="text-slate-400">
                Bring calm structure into this canvas. The bottom bar is your only switcher—everything else stays focused on its own space.
              </p>
            </div>
          </div>
          
          {/* Bottom Bar - Anchored to Canvas */}
          <div className="border-t border-slate-800 bg-[#0d1117]">
            <div className="flex items-center justify-center gap-2 px-8 py-4">
              <button className="flex h-12 w-12 items-center justify-center rounded-lg hover:bg-slate-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-lg hover:bg-slate-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-lg hover:bg-slate-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-lg hover:bg-slate-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
              <button className="flex h-12 w-12 items-center justify-center rounded-lg hover:bg-slate-800">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
            </div>
          </div>
        </main>
        
        {/* Right Panel - Always Visible */}
        <aside 
          className="relative flex flex-col border-l border-slate-800 bg-[#0d1117]"
          style={{ 
            width: 360,
            minWidth: 360,
            flexShrink: 0,
          }}
        >
          <div className="flex-1 overflow-y-auto p-4">
            {/* Calendar Section */}
            <div className="mb-6">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Calendar</span>
                <span className="text-xs">Time auth</span>
              </div>
              <div className="space-y-2">
                <EventItem title="Design" team="3 team" time="09:30" />
                <EventItem title="Client*" subtitle="Calm ch" time="12:00" />
                <EventItem title="Focus" subtitle="Reserve" time="15:30" />
              </div>
            </div>
            
            {/* Tasks Section */}
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-400">
                <CheckSquare className="h-4 w-4" />
                <span className="font-medium">Tasks</span>
                <span className="text-xs">Today</span>
              </div>
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Quick add"
                  className="w-full rounded bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2 text-sm">
                <div className="text-slate-300">Set next milest</div>
                <div className="text-slate-300">Review block</div>
                <div className="text-slate-300">Prep calm up</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ============================================================================
// SUPPORTING COMPONENTS
// ============================================================================

function ListItem({ name, count, active }: { name: string; count: number; active?: boolean }) {
  return (
    <button className={cn(
      "flex w-full items-center justify-between rounded px-2 py-1.5 text-sm transition-colors",
      active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-300"
    )}>
      <span>{name}</span>
      <span className="text-xs text-slate-500">{count}</span>
    </button>
  );
}

function ConnectorItem({ name, status, color }: { name: string; status: string; color: 'blue' | 'gray' }) {
  return (
    <div className="flex items-center justify-between rounded px-2 py-2 hover:bg-slate-800/50">
      <div className="flex items-center gap-2">
        <div className={cn(
          "h-2 w-2 rounded-full",
          color === 'blue' ? "bg-blue-500" : "bg-slate-600"
        )} />
        <span className="text-sm text-slate-300">{name}</span>
      </div>
      <span className="text-xs text-slate-500">{status}</span>
    </div>
  );
}

function EventItem({ title, subtitle, team, time }: { title: string; subtitle?: string; team?: string; time: string }) {
  return (
    <div className="flex items-start gap-3 rounded px-2 py-2 hover:bg-slate-800/50">
      <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500" />
      <div className="flex-1">
        <div className="text-sm font-medium text-slate-200">{title}</div>
        {(subtitle || team) && (
          <div className="text-xs text-slate-500">{subtitle || team}</div>
        )}
      </div>
      <div className="text-xs text-slate-500">{time}</div>
    </div>
  );
}
