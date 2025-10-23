import React, { useEffect, useState } from "react";
import ChatView from "./features/convos/ChatView";
import { ThemeStyles } from "./components/ThemeStyles";
import WorkspaceSettingsModal, { type WorkspaceSettings, WORKSPACE_SETTINGS_DEFAULTS } from "./components/WorkspaceSettingsModal";

const SETTINGS_STORAGE_KEY = "nexus.workspace.settings";

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<WorkspaceSettings>(() => ({ ...WORKSPACE_SETTINGS_DEFAULTS }));

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) {
        setSettings({ ...WORKSPACE_SETTINGS_DEFAULTS });
        return;
      }
      const parsed = JSON.parse(raw) as Partial<WorkspaceSettings> | null;
      setSettings({ ...WORKSPACE_SETTINGS_DEFAULTS, ...(parsed ?? {}) });
    } catch (error) {
      console.warn("Failed to load workspace settings", error);
      setSettings({ ...WORKSPACE_SETTINGS_DEFAULTS });
    }
  }, []);

  return (
    <>
      <ThemeStyles />
      <ChatView onOpenSettings={() => setSettingsOpen(true)} />
      <WorkspaceSettingsModal
        open={settingsOpen}
        initial={settings}
        onClose={() => setSettingsOpen(false)}
        onSave={next => {
          setSettings(next);
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
            }
          } catch (error) {
            console.warn("Failed to persist workspace settings", error);
          }
        }}
      />
    </>
  );
}
