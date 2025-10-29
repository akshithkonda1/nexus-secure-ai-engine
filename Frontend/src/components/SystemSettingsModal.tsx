import React from "react";

export type WorkspaceSettings = {
  consensusThreshold: number;
  maxSources: number;
  dependableThreshold: number;
  archiveDays: number;
  redactPII: boolean;
  crossCheck: boolean;
};

export const WORKSPACE_SETTINGS_DEFAULTS: WorkspaceSettings = {
  consensusThreshold: 0.7,
  maxSources: 3,
  dependableThreshold: 0.9,
  archiveDays: 30,
  redactPII: true,
  crossCheck: true,
};

export default function WorkspaceSettingsModal({
  open,
  initial = WORKSPACE_SETTINGS_DEFAULTS,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Partial<WorkspaceSettings>;
  onClose: () => void;
  onSave: (s: WorkspaceSettings) => void;
}) {
  if (!open) return null;
  const merged = { ...WORKSPACE_SETTINGS_DEFAULTS, ...initial };
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,.5)",
      display:"grid", placeItems:"center", zIndex:1000
    }}>
      <div style={{ background:"#121318", color:"#e5e7eb", padding:24, borderRadius:12, width:520 }}>
        <h2 style={{ marginTop:0 }}>System settings</h2>
        <p style={{ opacity:.8, marginBottom:16 }}>
          Placeholder modal to unblock the build.
        </p>
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button onClick={onClose}>Close</button>
          <button onClick={() => onSave(merged)}>Save</button>
        </div>
      </div>
    </div>
  );
}
