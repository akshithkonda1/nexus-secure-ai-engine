import { PropsWithChildren } from "react";
import RightRail from "../pages/rails/RightRail";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

type AppShellProps = PropsWithChildren<{
  rightRail?: React.ReactNode;
}>;

export default function AppShell({ children, rightRail }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[var(--layer-base)] text-[var(--text-primary)]">
      <Sidebar />
      <div className="flex flex-1 justify-center">
        <main className="flex w-full max-w-3xl flex-col px-8 py-12">
          <TopBar />
          {children}
        </main>
      </div>
      <RightRail>{rightRail}</RightRail>
    </div>
  );
}
