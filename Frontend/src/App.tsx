import React, { useEffect, useState } from "react";
import ChatView from "./features/convos/ChatView";
import { ThemeStyles } from "./components/ThemeStyles";
import WorkspaceSettingsModal, { type WorkspaceSettings } from "./components/WorkspaceSettingsModal";

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<WorkspaceSettings | undefined>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem("nexus.workspace.settings");
      if (!raw) {
        setSettings(undefined);
        return;
      }
      const parsed = JSON.parse(raw) as WorkspaceSettings;
      setSettings(parsed);
    } catch (error) {
      console.warn("Failed to load workspace settings", error);
      setSettings(undefined);
    }
  }, []);

  return (
    <>
      <ThemeStyles />
      <ChatView onOpenSettings={() => setSettingsOpen(true)} />
      <WorkspaceSettingsModal
        open={settingsOpen}
        initial={settings ?? undefined}
        onClose={() => setSettingsOpen(false)}
        onSave={next => {
          setSettings(next);
          window.localStorage.setItem("nexus.workspace.settings", JSON.stringify(next));
        }}
      />
    </>
  );
}
