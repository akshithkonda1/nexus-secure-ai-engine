import { PropsWithChildren } from "react";
import RightRail from "../pages/rails/RightRail";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

type AppShellProps = PropsWithChildren<{
  rightRail?: React.ReactNode;
}>;

export default function AppShell({ children, rightRail }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#FAFAFA] text-gray-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {/* Main Layout */}
      <div className="flex h-full w-full">
        {/* Left Sidebar */}
        <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:flex dark:border-slate-800 dark:bg-slate-900">
          <Sidebar />
        </aside>

        {/* Center Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Navigation Bar */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
             <TopBar />
          </header>

          <main className="flex-1 overflow-y-auto bg-[#FAFAFA] dark:bg-slate-950">
             <div className="mx-auto flex h-full max-w-5xl flex-col px-8 py-8">
               {children}
             </div>
          </main>
        </div>

        {/* Right Rail */}
        {rightRail && (
          <aside className="hidden w-80 shrink-0 border-l border-gray-200 bg-white xl:block dark:border-slate-800 dark:bg-slate-900">
            <RightRail>{rightRail}</RightRail>
          </aside>
        )}
      </div>
    </div>
  );
}
