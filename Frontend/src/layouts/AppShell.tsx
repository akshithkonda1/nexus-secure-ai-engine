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
      {/* Ambient Background - kept subtle */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[var(--bg-app)]">
        <div className="absolute -left-[10%] -top-[10%] h-[50vw] w-[50vw] rounded-full bg-[var(--ryuzen-azure)] opacity-[0.03] blur-[100px]" />
        <div className="absolute -right-[10%] bottom-[-10%] h-[50vw] w-[50vw] rounded-full bg-[var(--ryuzen-purple)] opacity-[0.03] blur-[100px]" />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex h-full w-full">
        {/* Left Sidebar */}
        <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-[var(--line-subtle)] bg-[var(--layer-base)] md:flex">
          <Sidebar />
        </aside>

        {/* Center Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Navigation Bar - Contextual per page */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--line-subtle)] bg-[var(--layer-base)/50] px-6 backdrop-blur-sm">
             <TopBar />
          </header>

          <main className="flex-1 overflow-y-auto">
             <div className="mx-auto flex h-full max-w-5xl flex-col px-8 py-8">
               {children}
             </div>
          </main>
        </div>

        {/* Right Rail */}
        {rightRail && (
          <aside className="hidden w-80 shrink-0 border-l border-[var(--line-subtle)] bg-[var(--layer-base)] xl:block">
            <RightRail>{rightRail}</RightRail>
          </aside>
        )}
      </div>
    </div>
  );
}
