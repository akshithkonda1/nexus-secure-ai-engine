import { PropsWithChildren } from "react";
import RightRail from "../pages/rails/RightRail";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

type AppShellProps = PropsWithChildren<{
  rightRail?: React.ReactNode;
}>;

export default function AppShell({ children, rightRail }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--layer-base)] text-[var(--text-primary)] transition-colors">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-10 px-8 py-10">
        <Sidebar />
        <div className="flex min-h-screen flex-1 gap-8">
          <div className="flex flex-1 flex-col rounded-2xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] px-10 py-8 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
            <TopBar />
            <main className="mt-8 flex flex-1 justify-center overflow-hidden">
              <div className="flex w-full max-w-4xl flex-col gap-10 pb-10">
                {children}
              </div>
            </main>
          </div>
          {rightRail ? <RightRail>{rightRail}</RightRail> : null}
        </div>
      </div>
    </div>
  );
}
