import type React from "react";
import { useMemo, useState } from "react";

import ToronHeader from "@/components/toron/ToronHeader";
import { useToronStore } from "@/state/toron/toronStore";
import { useTheme } from "@/theme/useTheme";

import ToronInputBar from "./ToronInputBar";
import ToronMessageList from "./ToronMessageList";
import ToronProjectsModal from "./ToronProjectsModal";

export function ToronPage() {
  const { resolvedTheme } = useTheme();
  const { clearChat } = useToronStore();
  const [projectsOpen, setProjectsOpen] = useState(false);

  const themeVars = useMemo(
    () => ({
      ["--toron-glass-light" as string]:
        resolvedTheme === "dark"
          ? "linear-gradient(145deg, rgba(30,41,59,0.92), rgba(15,23,42,0.94))"
          : "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(241,245,249,0.95))",
      ["--toron-glass-dark" as string]:
        resolvedTheme === "dark"
          ? "linear-gradient(135deg, rgba(30,41,59,0.85), rgba(79,70,229,0.35), rgba(16,185,129,0.35))"
          : "linear-gradient(135deg, rgba(255,255,255,0.85), rgba(99,102,241,0.28), rgba(56,189,248,0.22))",
      ["--toron-cosmic-primary" as string]: "rgba(99,102,241,0.28)",
      ["--toron-cosmic-secondary" as string]: "rgba(16,185,129,0.24)",
    }),
    [resolvedTheme],
  );

  return (
    <main
      className="relative flex h-full flex-col"
      style={themeVars as React.CSSProperties}
    >
      <ToronHeader
        onOpenProjects={() => setProjectsOpen(true)}
        onNewChat={() => clearChat()}
      />

      <ToronMessageList />

      <ToronInputBar />

      <ToronProjectsModal open={projectsOpen} onClose={() => setProjectsOpen(false)} />
    </main>
  );
}

export default ToronPage;
