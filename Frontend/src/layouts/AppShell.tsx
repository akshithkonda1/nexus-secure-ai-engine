import { PropsWithChildren } from "react";
import RightRail from "../pages/rails/RightRail";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

type AppShellProps = PropsWithChildren<{
  rightRail?: React.ReactNode;
}>;

export default function AppShell({ children, rightRail }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors">
      {/* Main Layout */}
      <div className="flex h-full w-full">
        {/* Left Sidebar */}
        <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-[var(--line-subtle)] bg-[var(--layer-surface)] text-[var(--text-primary)] md:flex">
          <Sidebar />
        </aside>

        {/* Center Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Navigation Bar */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--line-subtle)] bg-[var(--layer-surface)] px-6 text-[var(--text-primary)]">
             <TopBar />
          </header>

          <main className="flex-1 overflow-y-auto bg-[var(--bg-app)]">
             <div className="mx-auto flex h-full max-w-5xl flex-col px-8 py-8 text-[var(--text-primary)]">
               {children}
             </div>
          </main>
        </div>

        {/* Right Rail */}
        {rightRail && (
          <aside className="hidden w-80 shrink-0 border-l border-[var(--line-subtle)] bg-[var(--layer-surface)] text-[var(--text-primary)] xl:block">
            <RightRail>{rightRail}</RightRail>
          </aside>
        )}
      </div>
    </div>
  );
}
