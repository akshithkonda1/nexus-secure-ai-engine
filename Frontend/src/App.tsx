import React, { useEffect, useState } from "react";
import ChatView from "./features/convos/ChatView";
import { ThemeStyles } from "./components/ThemeStyles";
import WorkspaceSettingsModal, { type WorkspaceSettings, WORKSPACE_SETTINGS_DEFAULTS } from "./components/WorkspaceSettingsModal";
import { readConfig, writeConfig } from "./state/config";

const SETTINGS_STORAGE_KEY = "nexus.workspace.settings";
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<WorkspaceSettings>(() => ({ ...WORKSPACE_SETTINGS_DEFAULTS }));

  useEffect(() => {
    if (typeof window === "undefined") return;
    const config = readConfig();
    let stored: Partial<WorkspaceSettings> | null = null;
    try {
      const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (raw) {
        stored = JSON.parse(raw) as Partial<WorkspaceSettings>;
      }
    } catch (error) {
      console.warn("Failed to parse workspace settings from storage", error);
    }

    setSettings({
      ...WORKSPACE_SETTINGS_DEFAULTS,
      ...(stored ?? {}),
      archiveDays: config.retentionDays,
      dependableThreshold: clamp01(config.dependableThresholdPct / 100),
    });
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
          const sanitized: WorkspaceSettings = {
            ...next,
            consensusThreshold: clamp01(next.consensusThreshold),
            dependableThreshold: clamp01(next.dependableThreshold),
            maxSources: Math.max(1, Math.round(next.maxSources)),
            archiveDays: Math.max(0, Math.round(next.archiveDays)),
          };

          try {
            const updated = writeConfig({
              dependableThresholdPct: Math.round(sanitized.dependableThreshold * 100),
              retentionDays: sanitized.archiveDays,
            });
            sanitized.archiveDays = updated.retentionDays;
            sanitized.dependableThreshold = clamp01(updated.dependableThresholdPct / 100);
          } catch (error) {
            console.warn("Failed to persist workspace settings to config store", error);
          }

          setSettings(sanitized);
          try {
            if (typeof window !== "undefined") {
              window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(sanitized));
            }
          } catch (error) {
            console.warn("Failed to persist workspace settings", error);
          }
        }}
      />
    </>
  );
}
