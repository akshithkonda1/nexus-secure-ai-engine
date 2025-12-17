import { PropsWithChildren, ReactNode, useEffect, useMemo, useState } from "react";
import RightRail from "../pages/rails/RightRail";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

type AppShellProps = PropsWithChildren<{
  rightRail?: ReactNode;
  contentClassName?: string;
  fullBleed?: boolean;
}>;

export default function AppShell({ children, rightRail, contentClassName, fullBleed }: AppShellProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", isSidebarCollapsed.toString());
  }, [isSidebarCollapsed]);

  const handleToggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const mainContentClass = useMemo(
    () =>
      [
        fullBleed
          ? "flex h-full min-h-full w-full flex-col text-[var(--text)]"
          : "mx-auto flex h-full max-w-5xl flex-col px-6 py-6 text-[var(--text)]",
        contentClassName,
      ]
        .filter(Boolean)
        .join(" "),
    [contentClassName, fullBleed]
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-app)] text-[var(--text)] transition-colors">
      {/* Main Layout */}
      <div className="flex h-full w-full">
        {/* Left Sidebar */}
        <aside
          className={`hidden h-full shrink-0 flex-col border-r border-[var(--line-subtle)] bg-[var(--layer-surface)] text-[var(--text)] transition-[width] duration-200 ease-out md:flex ${isSidebarCollapsed ? "w-20" : "w-64"}`}
        >
          <Sidebar collapsed={isSidebarCollapsed} />
        </aside>

        {/* Center Content */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top Navigation Bar */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--line-subtle)] bg-[var(--layer-surface)] px-6 text-[var(--text)]">
            <TopBar onToggleSidebar={handleToggleSidebar} sidebarCollapsed={isSidebarCollapsed} />
          </header>

          <main className="flex-1 overflow-y-auto bg-[var(--bg-app)]">
            <div className={mainContentClass}>{children}</div>
          </main>
        </div>

        {/* Right Rail */}
        {rightRail && (
          <aside className="hidden w-80 shrink-0 border-l border-[var(--line-subtle)] bg-[var(--layer-surface)] text-[var(--text)] xl:block">
            <RightRail>{rightRail}</RightRail>
          </aside>
        )}
      </div>
    </div>
  );
}
