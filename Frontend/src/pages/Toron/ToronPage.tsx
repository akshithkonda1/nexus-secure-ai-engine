import { useState } from "react";

import { nanoid } from "nanoid";

import ToronHeader from "@/components/toron/ToronHeader";
import ToronInputBar from "./ToronInputBar";
import ToronMessageList from "./ToronMessageList";
import ToronProjectsModal from "./ToronProjectsModal";
import { useToronStore } from "@/state/toron/toronStore";
import type { ToronProject } from "./toronTypes";

export default function ToronPage() {
  const {
    addMessage,
    appendToMessage,
    clearChat,
    projectContext,
    activeProjectId,
    setProjectContext,
    setActiveProjectId,
    setLoading,
    loading,
  } = useToronStore();
  const [projectsOpen, setProjectsOpen] = useState(false);

  const handleSend = async (input: string) => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const contextualText =
      activeProjectId && projectContext
        ? `${projectContext}\n\nUser: ${trimmed}`
        : trimmed;

    const userMessageId = nanoid();
    const toronMessageId = nanoid();

    addMessage({
      id: userMessageId,
      sender: "user",
      text: trimmed,
      timestamp: Date.now(),
    });

    setLoading(true);

    try {
      addMessage({
        id: toronMessageId,
        sender: "toron",
        text: "",
        timestamp: Date.now(),
      });

      const response = `Toron received: "${contextualText}"`;

      for (let i = 0; i < response.length; i++) {
        const chunk = response[i];
        appendToMessage(toronMessageId, chunk);
        await new Promise((r) => setTimeout(r, 12));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (project: ToronProject) => {
    setActiveProjectId(project.id);
    setProjectContext(project.summary || "");
    setProjectsOpen(false);
  };

  return (
    <main className="relative flex h-full flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_45%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.14),transparent_50%),radial-gradient(circle_at_60%_70%,rgba(16,185,129,0.12),transparent_50%)] blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.06),transparent_45%),linear-gradient(200deg,rgba(255,255,255,0.05),transparent_50%)]" />
      <ToronHeader
        onOpenProjects={() => setProjectsOpen(true)}
        onNewChat={() => clearChat()}
      />
      <ToronMessageList />
      <ToronInputBar onSend={handleSend} loading={loading} />
      {projectsOpen && (
        <ToronProjectsModal
          onClose={() => setProjectsOpen(false)}
          onSelectProject={handleProjectSelect}
        />
      )}
    </main>
  );
}
