import React, { useMemo, useState } from "react";
import WorkspaceCanvas from "@/components/core/WorkspaceCanvas";
import LiquidOSBar from "@/components/core/LiquidOSBar";
import PagesPanel from "@/components/panels/PagesPanel";
import NotesPanel from "@/components/panels/NotesPanel";
import BoardsPanel from "@/components/panels/BoardsPanel";
import FlowsPanel from "@/components/panels/FlowsPanel";
import ToronPromptPanel from "@/components/panels/ToronPromptPanel";
import NotificationsPanel from "@/components/panels/NotificationsPanel";
import ProfilePanel from "@/components/panels/ProfilePanel";

export type PanelKey =
  | "pages"
  | "notes"
  | "boards"
  | "flows"
  | "toron"
  | "notifications"
  | "profile"
  | null;

const RyuzenWorkspace: React.FC = () => {
  const [activePanel, setActivePanel] = useState<PanelKey>(null);

  const floatingPanel = useMemo(() => {
    switch (activePanel) {
      case "pages":
        return <PagesPanel />;
      case "notes":
        return <NotesPanel />;
      case "boards":
        return <BoardsPanel />;
      case "flows":
        return <FlowsPanel />;
      case "toron":
        return <ToronPromptPanel />;
      case "notifications":
        return <NotificationsPanel />;
      case "profile":
        return <ProfilePanel />;
      default:
        return null;
    }
  }, [activePanel]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f1117] via-[#0b0f1d] to-[#101421] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(88,118,255,0.14),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(120,67,233,0.14),transparent_34%),radial-gradient(circle_at_50%_80%,rgba(16,185,129,0.1),transparent_32%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 pb-32 pt-12 lg:px-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">Ryuzen</p>
            <h1 className="text-3xl font-semibold tracking-tight">Workspace Canvas</h1>
            <p className="text-sm text-white/70">Activate LiquidOS nodes to load pages, notes, boards, flows, and Toron.</p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/70 shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            Floating Glass Mode
          </div>
        </div>

        <div className="mt-10 flex-1">
          <WorkspaceCanvas active={!!floatingPanel} onClose={() => setActivePanel(null)}>
            {floatingPanel}
          </WorkspaceCanvas>
        </div>
      </div>

      <LiquidOSBar activePanel={activePanel} openPanel={setActivePanel} />
    </div>
  );
};

export default RyuzenWorkspace;
