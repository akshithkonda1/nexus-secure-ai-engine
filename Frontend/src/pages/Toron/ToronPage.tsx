import { useEffect, useState } from "react";

import ToronHeader from "@/components/toron/ToronHeader";
import { useToronStore } from "@/state/toron/toronStore";

import ToronInputBar from "./ToronInputBar";
import ToronMessageList from "./ToronMessageList";
import ToronProjectsModal from "./ToronProjectsModal";

export default function ToronPage() {
  const { activeProjectId, projects, setProject, clearChat } = useToronStore();
  const [projectsOpen, setProjectsOpen] = useState(false);

  useEffect(() => {
    if (!activeProjectId && projects.length) {
      setProject(projects[0].id);
    }
  }, [activeProjectId, projects, setProject]);

  return (
    <main className="relative flex h-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.14),transparent_50%),radial-gradient(circle_at_60%_70%,rgba(16,185,129,0.12),transparent_50%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_45%),linear-gradient(200deg,rgba(255,255,255,0.05),transparent_50%)]" />
      <ToronHeader onOpenProjects={() => setProjectsOpen(true)} onNewChat={() => clearChat()} />
      <ToronMessageList />
      <ToronInputBar />
      {projectsOpen && <ToronProjectsModal onClose={() => setProjectsOpen(false)} />}
    </main>
  );
}
