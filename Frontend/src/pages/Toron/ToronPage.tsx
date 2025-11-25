import { useState } from "react";

import ToronHeader from "@/components/toron/ToronHeader";
import ToronInputBar from "./ToronInputBar";
import ToronMessageList from "./ToronMessageList";
import ToronProjectsModal from "./ToronProjectsModal";
import { useToronStore } from "@/state/toron/toronStore";

export default function ToronPage() {
  const { clearChat } = useToronStore();
  const [projectsOpen, setProjectsOpen] = useState(false);

  return (
    <main className="relative flex h-full flex-col">
      <ToronHeader
        onOpenProjects={() => setProjectsOpen(true)}
        onNewChat={() => clearChat()}
      />
      <ToronMessageList />
      <ToronInputBar />
      {projectsOpen && <ToronProjectsModal onClose={() => setProjectsOpen(false)} />}
    </main>
  );
}
