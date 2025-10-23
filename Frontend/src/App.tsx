import React, { useEffect, useState } from "react";
import ChatView from "./features/convos/ChatView";
import { ThemeStyles } from "./components/ThemeStyles";
import WorkspaceSettingsModal, {
  type WorkspaceSettings,
  WORKSPACE_SETTINGS_DEFAULTS,
} from "./components/WorkspaceSettingsModal";
import { readConfig, writeConfig } from "./state/config";

const SETTINGS_STORAGE_KEY = "nexus.workspace.settings";
const LEGACY_SETTINGS_STORAGE_KEY = "nexus_workspace_settings_v2";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const isFiniteNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const sanitizeWorkspaceOverrides = (value: unknown): Partial<WorkspaceSettings> => {
  if (!value || typeof value !== "object") return {};
  const obj = value as Record<string, unknown>;
  const next: Partial<WorkspaceSettings> = {};

  if (isFiniteNumber(obj.consensusThreshold)) {
    next.consensusThreshold = clamp(obj.consensusThreshold, 0, 1);
  }
  if (isFiniteNumber(obj.maxSources)) {
    next.maxSources = clamp(Math.round(obj.maxSources), 1, 10);
  }
  if (isFiniteNumber(obj.dependableThreshold)) {
    next.dependableThreshold = clamp(obj.dependableThreshold, 0, 1);
  }
  if (isFiniteNumber(obj.archiveDays)) {
    next.archiveDays = Math.max(0, Math.round(obj.archiveDays));
  }
  if (typeof obj.redactPII === "boolean") {
    next.redactPII = obj.redactPII;
  }
  if (typeof obj.crossCheck === "boolean") {
    next.crossCheck = obj.crossCheck;
  }

  return next;
};

const sanitizeLegacyOverrides = (value: unknown): Partial<WorkspaceSettings> => {
  if (!value || typeof value !== "object") return {};
  const obj = value as Record<string, unknown>;
  const next: Partial<WorkspaceSettings> = {};

  if (isFiniteNumber(obj.consensus)) {
    next.consensusThreshold = clamp(obj.consensus, 0, 1);
  }
  if (isFiniteNumber(obj.sources)) {
    next.maxSources = clamp(Math.round(obj.sources), 1, 10);
  }
  if (isFiniteNumber(obj.dependableThresholdPct)) {
    next.dependableThreshold = clamp(obj.dependableThresholdPct / 100, 0, 1);
  }
  if (isFiniteNumber(obj.retentionDays)) {
    next.archiveDays = Math.max(0, Math.round(obj.retentionDays));
  }
  if (typeof obj.redactPII === "boolean") {
    next.redactPII = obj.redactPII;
  }
  if (typeof obj.crossCheck === "boolean") {
    next.crossCheck = obj.crossCheck;
  }

  return next;
};

const mergeWithDefaults = (overrides: Partial<WorkspaceSettings>): WorkspaceSettings => ({
  ...WORKSPACE_SETTINGS_DEFAULTS,
  ...overrides,
});

const hydrateWorkspaceSettings = (): WorkspaceSettings => {
  const config = readConfig();

  let overrides: Partial<WorkspaceSettings> = {};
  let migratedFromLegacy = false;

  const stored = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (stored) {
    try {
      overrides = sanitizeWorkspaceOverrides(JSON.parse(stored));
    } catch (error) {
      console.warn("Failed to parse workspace settings", error);
    }
  } else {
    const legacy = window.localStorage.getItem(LEGACY_SETTINGS_STORAGE_KEY);
    if (legacy) {
      try {
        overrides = sanitizeLegacyOverrides(JSON.parse(legacy));
        migratedFromLegacy = true;
      } catch (error) {
        console.warn("Failed to parse legacy workspace settings", error);
      }
    }
  }

  const merged = mergeWithDefaults({
    ...overrides,
    dependableThreshold: clamp(config.dependableThresholdPct / 100, 0, 1),
    archiveDays: Math.max(0, Math.round(config.retentionDays)),
  });

  if (migratedFromLegacy) {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(merged));
    window.localStorage.removeItem(LEGACY_SETTINGS_STORAGE_KEY);
  }

  return merged;
};

export default function App() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<WorkspaceSettings>(WORKSPACE_SETTINGS_DEFAULTS);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setSettings(hydrateWorkspaceSettings());
    } catch (error) {
      console.warn("Failed to hydrate workspace settings", error);
      setSettings(WORKSPACE_SETTINGS_DEFAULTS);
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
          const sanitized = mergeWithDefaults(sanitizeWorkspaceOverrides(next));
          setSettings(sanitized);
          window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(sanitized));
          writeConfig({
            dependableThresholdPct: Math.round(clamp(sanitized.dependableThreshold, 0, 1) * 100),
            retentionDays: Math.max(0, Math.round(sanitized.archiveDays)),
          });
        }}
      />
    </>
  );
}
