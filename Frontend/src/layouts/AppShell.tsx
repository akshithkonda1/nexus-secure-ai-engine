import { PropsWithChildren } from "react";
import RightRail from "../pages/rails/RightRail";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

type AppShellProps = PropsWithChildren<{
  rightRail?: React.ReactNode;
}>;

export default function AppShell({ children, rightRail }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden text-[var(--text-primary)] transition-colors">
      {/* Ambient Background - minimalist dark mode blob */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-app">
        <div className="absolute -left-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full bg-cod-gray-800 opacity-[0.05] blur-[120px]" />
        <div className="absolute -right-[10%] bottom-[-10%] h-[50vw] w-[50vw] rounded-full bg-cod-gray-800 opacity-[0.05] blur-[120px]" />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex h-full w-full">
        {/* Left Sidebar */}
        <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-subtle bg-panel md:flex">
          <Sidebar />
        </aside>

        {/* Center Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Navigation Bar */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-subtle bg-app/50 px-6 backdrop-blur-md">
             <TopBar />
          </header>

          <main className="flex-1 overflow-y-auto bg-app">
             <div className="mx-auto flex h-full max-w-5xl flex-col px-8 py-8">
               {children}
             </div>
          </main>
        </div>

        {/* Right Rail */}
        {rightRail && (
          <aside className="hidden w-80 shrink-0 border-l border-subtle bg-panel xl:block">
            <RightRail>{rightRail}</RightRail>
          </aside>
        )}
      </div>
    </div>
  );
}
