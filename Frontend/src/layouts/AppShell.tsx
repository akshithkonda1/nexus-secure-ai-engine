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
      <div className="mx-auto flex min-h-screen w-full max-w-[1480px] px-8 py-10">
        <div className="sticky top-10 h-[calc(100vh-80px)] w-64 shrink-0">
          <Sidebar />
        </div>
        <div className="flex flex-1 items-start gap-8 overflow-hidden">
          <div className="flex flex-1 justify-center overflow-hidden">
            <div className="flex h-[calc(100vh-80px)] w-full max-w-[980px] flex-col overflow-hidden rounded-3xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] px-10 py-8 shadow-[0_18px_36px_-28px_var(--ryuzen-cod-gray)]">
              <TopBar />
              <main className="mt-8 flex flex-1 overflow-hidden">
                <div className="mx-auto flex max-w-4xl flex-col gap-12 overflow-y-auto pb-14 pr-1">
                  {children}
                </div>
              </main>
            </div>
          </div>
          <div className="w-0 shrink-0 xl:w-[18rem]">
            {rightRail ? (
              <RightRail>{rightRail}</RightRail>
            ) : (
              <div
                className="hidden h-[calc(100vh-80px)] rounded-3xl border border-[var(--line-subtle)] bg-[var(--layer-surface)] xl:block"
                aria-hidden
              />
            )}
          </div>
        </div>
      </div>
      <RightRail>{rightRail}</RightRail>
    </div>
  );
}
