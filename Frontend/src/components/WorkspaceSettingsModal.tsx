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
 * - Dark/Light friendly via Tailwind classes
 * - Zero external deps (except Tailwind & lucide-react if you add icons)
 *
 * Drop-in usage (example):
 *   <WorkspaceSettingsModal
 *      open={settingsOpen}
 *      initial={{ consensusThreshold: 0.7, maxSources: 3, dependableThreshold: 0.9, archiveDays: 30, redactPII: true, crossCheck: true }}
 *      onClose={() => setSettingsOpen(false)}
 *      onSave={(settings) => saveSettings(settings)}
 *   />
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
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      {/* Dialog */}
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="ws-title"
        className="absolute right-1/2 translate-x-1/2 top-6 w-[min(720px,92vw)]
                   rounded-2xl shadow-2xl border border-zinc-800/80 bg-zinc-900 text-zinc-50
                   overflow-hidden"
      >
        {/* Sticky header */}
        <header className="sticky top-0 flex items-center justify-between gap-3 px-5 h-14
                           border-b border-zinc-800/80 bg-zinc-900/95 backdrop-blur">
          <div>
            <h2 id="ws-title" className="text-base font-semibold">Workspace settings</h2>
            <p className="text-xs text-zinc-400">Tune guardrails, retention, and consensus controls.</p>
          </div>
          <button
            onClick={() => { onSave(settings); onClose(); }}
            disabled={!dirty}
            className={`h-9 px-4 rounded-xl text-sm font-medium border transition
                        ${dirty ? "bg-white text-zinc-900 hover:opacity-90 border-white" : "bg-transparent text-zinc-400 border-zinc-700 cursor-not-allowed"}`}
          >
            Save
          </button>
        </header>

        {/* Scrollable body */}
        <div className="max-h-[min(76vh,680px)] overflow-y-auto px-5 py-5 space-y-8">
          {/* Policies */}
          <section>
            <div className="text-sm font-medium mb-3">Policies</div>
            <div className="flex flex-wrap gap-2">
              <Chip active>Standard mode</Chip>
              <Chip active={settings.redactPII} onClick={() => setSettings(s => ({...s, redactPII: !s.redactPII}))}>Redact PII: {settings.redactPII ? "On" : "Off"}</Chip>
              <Chip active={settings.crossCheck} onClick={() => setSettings(s => ({...s, crossCheck: !s.crossCheck}))}>Cross‑check: {settings.crossCheck ? "On" : "Off"}</Chip>
            </div>
          </section>

          {/* Thresholds */}
          <section>
            <div className="text-sm font-medium mb-3">Thresholds</div>
            <div className="grid md:grid-cols-2 gap-4">
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

          {/* Behavior */}
          <section>
            <div className="text-sm font-medium mb-3">Behavior</div>
            <div className="grid md:grid-cols-2 gap-4">
              <Card title="Dependable threshold (%)" hint="Below this confidence Nexus augments answers with real‑time web data.">
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

        {/* Sticky footer */}
        <footer className="sticky bottom-0 flex items-center justify-between gap-3 px-5 h-12
                           border-t border-zinc-800/80 bg-zinc-900/95 backdrop-blur text-xs">
          <div className="text-zinc-400">{dirty ? "Unsaved changes" : "All changes saved"}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setSettings(merged)}
              disabled={!dirty}
              className={`h-8 px-3 rounded-lg border transition ${dirty? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-800 text-zinc-500 cursor-not-allowed"}`}>Discard</button>
            <button onClick={() => { onSave(settings); onClose(); }}
              disabled={!dirty}
              className={`h-8 px-3 rounded-lg border transition ${dirty? "bg-white text-zinc-900 hover:opacity-90 border-white" : "border-zinc-800 text-zinc-500 cursor-not-allowed"}`}>Save changes</button>
          </div>
        </footer>
      </section>
    </div>
  );
}

// ---------- Reusable UI bits
function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode; }) {
  return (
    <div className="rounded-2xl border border-zinc-800/80 p-4">
      <div className="font-medium text-sm mb-1">{title}</div>
      {hint && <p className="text-xs text-zinc-400 mb-3">{hint}</p>}
      {children}
    </div>
  );
}

function Chip({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick?: () => void; }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-8 px-3 rounded-full border text-sm transition select-none
                  ${active ? "bg-zinc-100 text-zinc-900 border-zinc-100" : "border-zinc-700 text-zinc-200 hover:bg-zinc-800"}`}
    >
      {children}
    </button>
  );
}

function NumberField({ value, onChange, min=0, max=9999 }: { value: number; onChange: (n: number) => void; min?: number; max?: number; }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(clamp(value - 1, min, max))}
        className="h-8 w-8 grid place-items-center rounded-lg border border-zinc-700 hover:bg-zinc-800"
        aria-label="Decrement"
      >−</button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        className="h-9 w-24 text-center rounded-lg bg-zinc-950 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-400"
      />
      <button
        onClick={() => onChange(clamp(value + 1, min, max))}
        className="h-8 w-8 grid place-items-center rounded-lg border border-zinc-700 hover:bg-zinc-800"
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
      <div className="text-xs text-zinc-400 mb-2">{format ? format(value) : value}</div>
      <input
        ref={refEl as any}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 appearance-none rounded-full outline-none cursor-pointer bg-zinc-700"
        style={trackStyle(progress01)}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
      />
    </div>
  );
}
