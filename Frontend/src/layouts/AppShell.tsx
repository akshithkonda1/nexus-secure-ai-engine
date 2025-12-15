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
      <div className="mx-auto flex min-h-screen max-w-6xl gap-12 px-10 py-12">
        <Sidebar />
        <div className="flex min-h-screen flex-1 gap-10">
          <div className="flex flex-1 flex-col rounded-3xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] px-12 py-10 shadow-[0_18px_36px_-28px_var(--ryuzen-cod-gray)]">
            <TopBar />
            <main className="mt-10 flex flex-1 justify-center overflow-hidden">
              <div className="flex w-full max-w-4xl flex-col gap-12 pb-12">
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
