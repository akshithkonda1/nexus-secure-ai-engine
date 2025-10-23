import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * WorkspaceSettingsModal.tsx
 * ---------------------------------------------------------------------------
 * A polished, accessible, scrollable settings dialog for Nexus.
 * - Sticky header & footer
 * - Backdrop gated by `open`
 * - Keyboard support (Esc to close)
 * - Focus management (auto-focus first control on open)
 * - Dirty state detection with Save/Discard
 */

// ---------- Types
export type WorkspaceSettings = {
  consensusThreshold: number; // 0..1
  maxSources: number;         // 1..10
  dependableThreshold: number;// 0..1
  archiveDays: number;        // >= 0
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

// ---------- Utilities
function clamp(n: number, min: number, max: number) { return Math.min(max, Math.max(min, n)); }
function fmtPct(n: number) { return `${Math.round(n * 100)}%`; }

function useDirty<T>(value: T, baseline: T) {
  const [dirty, setDirty] = useState(false);
  useEffect(() => { setDirty(JSON.stringify(value) !== JSON.stringify(baseline)); }, [value, baseline]);
  return dirty;
}

// A prettier range track using a CSS gradient to show progress
function trackStyle(progress01: number) {
  const pct = clamp(progress01, 0, 1) * 100;
  return {
    background: `linear-gradient(90deg, rgb(24,24,27) 0%, rgb(24,24,27) ${pct}%, rgb(63,63,70) ${pct}%, rgb(63,63,70) 100%)`,
  } as React.CSSProperties;
}

// ---------- Main component
export default function WorkspaceSettingsModal({
  open,
  initial = WORKSPACE_SETTINGS_DEFAULTS,
  onClose,
  onSave,
}: {
  open: boolean;
  initial?: Partial<WorkspaceSettings>;
  onClose: () => void;
  onSave: (settings: WorkspaceSettings) => void;
}) {
  const merged = useMemo<WorkspaceSettings>(() => ({...WORKSPACE_SETTINGS_DEFAULTS, ...initial}), [initial]);
  const [settings, setSettings] = useState<WorkspaceSettings>(merged);
  useEffect(() => setSettings(merged), [merged, open]);

  const dirty = useDirty(settings, merged);
  const firstControlRef = useRef<HTMLInputElement | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus first control on open
  useEffect(() => { if (open) setTimeout(() => firstControlRef.current?.focus(), 0); }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop workspace-modal-backdrop" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ws-title"
        className="workspace-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="workspace-modal-scroll">
          <header className="workspace-modal-header">
            <div>
              <h2 id="ws-title" className="workspace-modal-title">Workspace settings</h2>
              <p className="workspace-modal-subtitle">Tune guardrails, retention, and consensus controls.</p>
            </div>
            <button
              onClick={() => { onSave(settings); onClose(); }}
              disabled={!dirty}
              className="workspace-modal-save"
              type="button"
            >
              Save
            </button>
          </header>

          <div className="workspace-modal-body">
            <section className="workspace-section">
              <div className="workspace-section-title">Policies</div>
              <div className="workspace-chip-row">
                <Chip active>Standard mode</Chip>
                <Chip active={settings.redactPII} onClick={() => setSettings(s => ({...s, redactPII: !s.redactPII}))}>Redact PII: {settings.redactPII ? "On" : "Off"}</Chip>
                <Chip active={settings.crossCheck} onClick={() => setSettings(s => ({...s, crossCheck: !s.crossCheck}))}>Cross-check: {settings.crossCheck ? "On" : "Off"}</Chip>
              </div>
            </section>

            <section className="workspace-section">
              <div className="workspace-section-title">Thresholds</div>
              <div className="workspace-card-grid">
                <Card title="Consensus threshold" hint="Require higher agreement between models before surfacing an answer.">
                  <Range
                    refEl={firstControlRef}
                    min={0} max={1} step={0.01}
                    value={settings.consensusThreshold}
                    onChange={(v) => setSettings(s => ({...s, consensusThreshold: v}))}
                    format={(v)=> v.toFixed(2)}
                  />
                </Card>

                <Card title="Max sources" hint="Control how many documents Nexus references in each response.">
                  <Range
                    min={1} max={10} step={1}
                    value={settings.maxSources}
                    onChange={(v) => setSettings(s => ({...s, maxSources: Math.round(v)}))}
                    format={(v)=> v.toFixed(0)}
                  />
                </Card>
              </div>
            </section>

            <section className="workspace-section">
              <div className="workspace-section-title">Behavior</div>
              <div className="workspace-card-grid">
                <Card title="Dependable threshold (%)" hint="Below this confidence Nexus augments answers with real-time web data.">
                  <Range
                    min={0} max={1} step={0.01}
                    value={settings.dependableThreshold}
                    onChange={(v) => setSettings(s => ({...s, dependableThreshold: v}))}
                    format={(v)=> fmtPct(v)}
                  />
                </Card>

                <Card title="Archive retention (days)" hint="Archived/deleted chats purge automatically after the selected number of days.">
                  <NumberField
                    value={settings.archiveDays}
                    onChange={(n) => setSettings(s => ({...s, archiveDays: clamp(Math.round(n), 0, 3650)}))}
                    min={0}
                    max={3650}
                  />
                </Card>
              </div>
            </section>
          </div>
        </div>

        <footer className="workspace-modal-footer">
          <div className="workspace-modal-status">{dirty ? "Unsaved changes" : "All changes saved"}</div>
          <div className="workspace-modal-actions">
            <button
              onClick={() => setSettings(merged)}
              disabled={!dirty}
              className="workspace-modal-reset"
              type="button"
            >
              Discard
            </button>
            <button
              onClick={() => { onSave(settings); onClose(); }}
              disabled={!dirty}
              className="workspace-modal-save"
              type="button"
            >
              Save changes
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

// ---------- Reusable UI bits
function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode; }) {
  return (
    <div className="workspace-card">
      <div className="workspace-card-title">{title}</div>
      {hint && <p className="workspace-card-hint">{hint}</p>}
      {children}
    </div>
  );
}

function Chip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void; }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`workspace-chip ${active ? "is-active" : ""}`}
    >
      {children}
    </button>
  );
}

function NumberField({ value, onChange, min=0, max=9999 }: { value: number; onChange: (n: number) => void; min?: number; max?: number; }) {
  return (
    <div className="workspace-number">
      <button
        onClick={() => onChange(clamp(value - 1, min, max))}
        className="workspace-number-button"
        aria-label="Decrement"
      >−</button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        className="workspace-number-input"
      />
      <button
        onClick={() => onChange(clamp(value + 1, min, max))}
        className="workspace-number-button"
        aria-label="Increment"
      >+</button>
    </div>
  );
}

function Range({
  value,
  onChange,
  min,
  max,
  step,
  format,
  refEl,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  refEl?: React.RefObject<HTMLInputElement | null>;
}) {
  const progress01 = (value - min) / (max - min);
  return (
    <div>
      <div className="workspace-range-value">{format ? format(value) : value}</div>
      <input
        ref={refEl as any}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="workspace-range"
        style={trackStyle(progress01)}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  );
}
