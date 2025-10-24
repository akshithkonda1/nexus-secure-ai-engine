import React, { useEffect, useState, useCallback } from "react";
import WorkPlaceSettingsModal, {
  WORKSPACE_SETTINGS_DEFAULTS,
  type WorkspaceSettings,
} from "../components/WorkPlaceSettingsModal";
import { readConfig, writeConfig } from "../state/config";
import { useNavigate } from "react-router-dom";

const STORAGE_KEY = "nexus.system_settings";
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export default function SystemSettingsPage() {
  const [open, setOpen] = useState(true);
  const [initial, setInitial] = useState<WorkspaceSettings>(WORKSPACE_SETTINGS_DEFAULTS);
  const navigate = useNavigate();

  useEffect(() => {
    const config = readConfig();
    let stored: Partial<WorkspaceSettings> | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        stored = JSON.parse(raw) as Partial<WorkspaceSettings>;
      }
    } catch (error) {
      console.warn("Failed to parse stored system settings", error);
    }

    setInitial({
      ...WORKSPACE_SETTINGS_DEFAULTS,
      ...(stored ?? {}),
      archiveDays: config.retentionDays,
      dependableThreshold: clamp01(config.dependableThresholdPct / 100),
    });
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    navigate("/", { replace: true });
  }, [navigate]);

  return (
    <>
      <WorkPlaceSettingsModal
        open={open}
        initial={initial}
        onClose={handleClose}
        onSave={(settings) => {
          const sanitized: WorkspaceSettings = {
            ...settings,
            consensusThreshold: clamp01(settings.consensusThreshold),
            dependableThreshold: clamp01(settings.dependableThreshold),
            maxSources: Math.max(1, Math.round(settings.maxSources)),
            archiveDays: Math.max(0, Math.round(settings.archiveDays)),
          };

          try {
            const updated = writeConfig({
              dependableThresholdPct: Math.round(sanitized.dependableThreshold * 100),
              retentionDays: sanitized.archiveDays,
            });
            sanitized.archiveDays = updated.retentionDays;
            sanitized.dependableThreshold = clamp01(updated.dependableThresholdPct / 100);
          } catch (error) {
            console.warn("Failed to persist system settings to config store", error);
          }

          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
          } catch (error) {
            console.warn("Failed to persist system settings", error);
          }

          setInitial(sanitized);
        }}
      />
    </>
  );
}
