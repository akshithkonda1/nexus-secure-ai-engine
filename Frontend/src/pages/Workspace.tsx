import { useState } from 'react';
import { 
  Calendar, 
  Users, 
  MessageSquare, 
  Settings, 
  PanelLeftClose,
  PanelLeftOpen,
  Link2,
  Clock,
  CheckSquare
} from 'lucide-react';

export default function Workspace() {
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  
  // Fixed widths for clean layout
  const leftWidth = leftSidebarCollapsed ? 48 : 280;
  const rightWidth = rightPanelCollapsed ? 48 : 360;
  
  return (
    <div className="flex h-screen overflow-hidden bg-[#0f1419] text-white">
      {/* Left Sidebar - Lists & Connectors */}
      <aside 
        className="group relative flex flex-col border-r border-slate-800 bg-[#0d1117] transition-all duration-300"
        style={{ 
          width: `${leftWidth}px`,
          minWidth: `${leftWidth}px`,
        }}
      >
        {!leftSidebarCollapsed ? (
          <>
            {/* Collapse Button - Hover to reveal */}
            <button
              onClick={() => setLeftSidebarCollapsed(true)}
              className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-[#0d1117] opacity-0 transition-opacity hover:bg-slate-800 group-hover:opacity-100"
              title="Collapse sidebar (Cmd+B)"
            >
              <PanelLeftClose className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* Lists Section */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">Lists</span>
                  <span className="text-xs">Semantic shelves</span>
                </div>
                <button className="rounded p-1 hover:bg-slate-800">
                  <span className="text-lg">+</span>
                </button>
              </div>

              {/* List Items */}
              <div className="space-y-2">
                <button className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-slate-800">
                  <span className="text-sm font-medium">Research</span>
                  <span className="text-xs text-slate-500">12</span>
                </button>
                <button className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-slate-800">
                  <span className="text-sm font-medium">Delivery</span>
                  <span className="text-xs text-slate-500">8</span>
                </button>
                <button className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-slate-800">
                  <span className="text-sm font-medium">Backlog</span>
                  <span className="text-xs text-slate-500">19</span>
                </button>
              </div>

              <div className="mt-4 text-xs text-slate-500">
                Selected list: Research
              </div>
            </div>

            {/* Connectors Section */}
            <div className="border-t border-slate-800 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Link2 className="h-4 w-4" />
                  <span className="font-medium">Connectors</span>
                  <span className="text-xs">Ecosystems linked</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Settings className="h-3 w-3" />
                  <span>No alerts</span>
                </div>
              </div>

              {/* Connector Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">GitHub</span>
                  </div>
                  <span className="text-xs text-green-500">Healthy</span>
                </div>
                <div className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Notion</span>
                  </div>
                  <span className="text-xs text-slate-500">Idle</span>
                </div>
                <div className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Linear</span>
                  </div>
                  <span className="text-xs text-slate-500">Listening</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Collapsed State - Expand Trigger
          <button
            onClick={() => setLeftSidebarCollapsed(false)}
            className="flex h-full items-center justify-center hover:bg-slate-800/50"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="h-4 w-4 text-slate-400" />
          </button>
        )}
      </aside>

      {/* Center Canvas - Focus Surface */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Canvas Content */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="max-w-2xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-4">
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
              FOCUS SURFACE
            </div>
            
            <h1 className="mb-3 text-3xl font-bold">Pages</h1>
            
            <p className="mb-8 text-slate-400">
              Narratives, blueprints, and full context.
            </p>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <h2 className="mb-2 text-lg font-semibold">Center is clear</h2>
              <p className="text-sm text-slate-400">
                Bring calm structure into this canvas. The bottom bar is your only switcher—everything
                else stays focused on its own space.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Bar */}
        <nav className="flex items-center justify-center gap-2 border-t border-slate-800 bg-[#0d1117] p-4">
          <button className="rounded-lg p-3 hover:bg-slate-800">
            <MessageSquare className="h-5 w-5 text-slate-400" />
          </button>
          <button className="rounded-lg p-3 hover:bg-slate-800">
            <Users className="h-5 w-5 text-slate-400" />
          </button>
          <button className="rounded-lg p-3 hover:bg-slate-800">
            <Calendar className="h-5 w-5 text-slate-400" />
          </button>
          <button className="rounded-lg p-3 hover:bg-slate-800">
            <Link2 className="h-5 w-5 text-slate-400" />
          </button>
          <button className="rounded-lg bg-blue-600 p-3 hover:bg-blue-700">
            <MessageSquare className="h-5 w-5" />
          </button>
          <button className="rounded-lg p-3 hover:bg-slate-800">
            <Settings className="h-5 w-5 text-slate-400" />
          </button>
        </nav>
      </main>

      {/* Right Panel - Calendar & Tasks */}
      <aside 
        className="group relative flex flex-col border-l border-slate-800 bg-[#0d1117] transition-all duration-300"
        style={{ 
          width: `${rightWidth}px`,
          minWidth: `${rightWidth}px`,
        }}
      >
        {!rightPanelCollapsed ? (
          <>
            {/* Collapse Button - Hover to reveal */}
            <button
              onClick={() => setRightPanelCollapsed(true)}
              className="absolute -left-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-[#0d1117] opacity-0 transition-opacity hover:bg-slate-800 group-hover:opacity-100"
              title="Collapse panel (Cmd+/)"
            >
              <PanelLeftOpen className="h-3.5 w-3.5 rotate-180 text-slate-400" />
            </button>

            {/* Calendar Section */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Calendar</span>
                <span className="text-xs">Time auth</span>
              </div>

              {/* Upcoming Events */}
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-800 p-3">
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Design Review</div>
                      <div className="text-xs text-slate-500">3 team members</div>
                      <div className="mt-1 text-xs text-slate-400">09:30</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 p-3">
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Client Call</div>
                      <div className="text-xs text-slate-500">Calm check-in</div>
                      <div className="mt-1 text-xs text-slate-400">12:00</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-800 p-3">
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 text-slate-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Focus Block</div>
                      <div className="text-xs text-slate-500">Reserved time</div>
                      <div className="mt-1 text-xs text-slate-400">15:30</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks Section */}
            <div className="border-t border-slate-800 p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <CheckSquare className="h-4 w-4" />
                  <span className="font-medium">Tasks</span>
                  <span className="text-xs">Today</span>
                </div>
              </div>

              {/* Quick Add */}
              <input
                type="text"
                placeholder="Quick add"
                className="mb-3 w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm placeholder-slate-500 focus:border-blue-500 focus:outline-none"
              />

              {/* Task List */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <input type="checkbox" className="rounded" />
                  <span>Set next milestone</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 line-through">
                  <input type="checkbox" checked className="rounded" />
                  <span>Review blockers</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <input type="checkbox" className="rounded" />
                  <span>Prep calm update</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          // Collapsed State - Expand Trigger
          <button
            onClick={() => setRightPanelCollapsed(false)}
            className="flex h-full items-center justify-center hover:bg-slate-800/50"
            title="Expand panel"
          >
            <PanelLeftClose className="h-4 w-4 text-slate-400" />
          </button>
        )}
      </aside>
    </div>
  );
}
