import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

/**
 * WorkPlaceSettingsModal.tsx — premium popup
 * - Portal popup (not full page)
 * - Close "×" button + Esc + backdrop click
 * - Vertical + horizontal scroll in body
 * - Iconic chips + polished sliders
 * - Focus trap + hotkeys + a11y
 */

export type WorkspaceSettings = {
  consensusThreshold: number; // 0..1
  maxSources: number; // 1..10
  dependableThreshold: number; // 0..1
  archiveDays: number; // >= 0
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

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}
function fmtPct(n: number) {
  return `${Math.round(n * 100)}%`;
}
function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
function useDirty<T>(value: T, baseline: T) {
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    setDirty(JSON.stringify(value) !== JSON.stringify(baseline));
  }, [value, baseline]);
  return dirty;
}
const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        border: 0,
      }}
    >
      {children}
    </span>
  );
}

function trackStyle(progress01: number) {
  const pct = clamp(progress01, 0, 1) * 100;
  return {
    background: `linear-gradient(90deg, rgb(24,24,27) 0%, rgb(24,24,27) ${pct}%, rgb(63,63,70) ${pct}%, rgb(63,63,70) 100%)`,
  } as React.CSSProperties;
}

/* --------------------------------- Modal ---------------------------------- */

export default function WorkPlaceSettingsModal({
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
  const merged = useMemo<WorkspaceSettings>(
    () => ({ ...WORKSPACE_SETTINGS_DEFAULTS, ...initial }),
    [initial]
  );
  const [settings, setSettings] = useState<WorkspaceSettings>(merged);
  useEffect(() => {
    if (open) setSettings(merged);
  }, [merged, open]);

  const dirty = useDirty(settings, merged);

  const titleId = useId();
  const descId = useId();

  const firstControlRef = useRef<HTMLInputElement | null>(null);
  const dialogRef = useRef<HTMLElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  // focus trap + restore focus
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const t = setTimeout(() => {
      (firstControlRef.current ?? dialogRef.current)?.focus();
    }, 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const root = dialogRef.current;
      if (!root) return;
      const focusables = root.querySelectorAll<HTMLElement>(
        [
          "button:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[href]",
          "[tabindex]:not([tabindex='-1'])",
        ].join(",")
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // hotkeys
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key.toLowerCase() === "s" || e.key === "Enter")) {
        e.preventDefault();
        if (dirty) onSave(settings);
        onClose();
        return;
      }
      if (e.shiftKey && e.key === "Escape") {
        e.preventDefault();
        if (dirty) setSettings(merged);
        onClose();
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dirty, merged, settings, onClose, onSave]);

  if (!open) return null;

  const saveAndClose = () => {
    if (dirty) onSave(settings);
    onClose();
  };
  const discardAndStay = () => {
    if (dirty) setSettings(merged);
  };

  const body = (
    <div className="modal-backdrop workspace-modal-backdrop" onClick={onClose}>
      <section
        ref={dialogRef as any}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className={["workspace-modal", prefersReducedMotion ? "rm" : "animate-in"].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="workspace-modal-scroll">
          {/* Header */}
          <header className="workspace-modal-header">
            <div>
              <h2 id={titleId} className="workspace-modal-title">
                System settings
              </h2>
              <p id={descId} className="workspace-modal-subtitle">
                Tune guardrails, privacy, and consensus controls.
              </p>
            </div>

            <div className="workspace-modal-header-actions">
              <button
                onClick={saveAndClose}
                disabled={!dirty}
                aria-disabled={!dirty}
                className="workspace-modal-save"
                type="button"
              >
                Save <VisuallyHidden>settings</VisuallyHidden>
              </button>
              <button
                onClick={onClose}
                aria-label="Close system settings"
                className="workspace-modal-close"
                type="button"
                title="Close"
              >
                ×
              </button>
            </div>
          </header>

          {/* Body: both-axis scroll */}
          <div
            className="workspace-modal-body"
            style={{ overflow: "auto", overscrollBehavior: "contain" as any }}
          >
            {/* Policies */}
            <section className="workspace-section" style={{ minWidth: 840 }}>
              <div className="workspace-section-title">Policies</div>
              <div className="workspace-chip-row">
                <Chip active ariaCurrent="page" icon={<SparklesIcon />}>
                  Standard mode
                </Chip>
                <Chip
                  active={settings.redactPII}
                  onClick={() => setSettings((s) => ({ ...s, redactPII: !s.redactPII }))}
                  icon={<ShieldIcon />}
                >
                  Redact PII: {settings.redactPII ? "On" : "Off"}
                </Chip>
                <Chip
                  active={settings.crossCheck}
                  onClick={() => setSettings((s) => ({ ...s, crossCheck: !s.crossCheck }))}
                  icon={<LinkCheckIcon />}
                >
                  Cross-check: {settings.crossCheck ? "On" : "Off"}
                </Chip>
              </div>
            </section>

            {/* Thresholds */}
            <section className="workspace-section" style={{ minWidth: 840 }}>
              <div className="workspace-section-title">Thresholds</div>
              <div className="workspace-card-grid">
                <Card
                  title="Consensus threshold"
                  hint="Require higher agreement between models before surfacing an answer."
                >
                  <Range
                    refEl={firstControlRef}
                    id="consensus-threshold"
                    min={0}
                    max={1}
                    step={0.01}
                    value={settings.consensusThreshold}
                    onChange={(v) =>
                      setSettings((s) => ({ ...s, consensusThreshold: clamp(v, 0, 1) }))
                    }
                    format={(v) => v.toFixed(2)}
                    ariaLabel="Consensus threshold"
                  />
                </Card>
                <Card
                  title="Max sources"
                  hint="Control how many documents Nexus references in each response."
                >
                  <Range
                    id="max-sources"
                    min={1}
                    max={10}
                    step={1}
                    value={settings.maxSources}
                    onChange={(v) =>
                      setSettings((s) => ({ ...s, maxSources: Math.round(clamp(v, 1, 10)) }))
                    }
                    format={(v) => v.toFixed(0)}
                    ariaLabel="Maximum sources"
                  />
                </Card>
              </div>
            </section>

            {/* Behavior */}
            <section className="workspace-section" style={{ minWidth: 840 }}>
              <div className="workspace-section-title">Behavior</div>
              <div className="workspace-card-grid">
                <Card
                  title="Dependable threshold (%)"
                  hint="Below this confidence Nexus augments answers with real-time web data."
                >
                  <Range
                    id="dependable-threshold"
                    min={0}
                    max={1}
                    step={0.01}
                    value={settings.dependableThreshold}
                    onChange={(v) =>
                      setSettings((s) => ({ ...s, dependableThreshold: clamp(v, 0, 1) }))
                    }
                    format={(v) => fmtPct(v)}
                    ariaLabel="Dependable threshold percentage"
                  />
                </Card>
                <Card
                  title="Archive retention (days)"
                  hint="Archived/deleted chats purge automatically after the selected number of days."
                >
                  <NumberField
                    id="archive-days"
                    value={settings.archiveDays}
                    onChange={(n) =>
                      setSettings((s) => ({ ...s, archiveDays: clamp(Math.round(n), 0, 3650) }))
                    }
                    min={0}
                    max={3650}
                    ariaLabel="Archive retention in days"
                  />
                </Card>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="workspace-modal-footer">
          <div className="workspace-modal-status" aria-live="polite" aria-atomic="true">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </div>
          <div className="workspace-modal-actions">
            <button
              onClick={discardAndStay}
              disabled={!dirty}
              aria-disabled={!dirty}
              className="workspace-modal-reset"
              type="button"
            >
              Discard
            </button>
            <button
              onClick={saveAndClose}
              disabled={!dirty}
              aria-disabled={!dirty}
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

  return createPortal(body, document.body);
}

/* ------------------------------- UI Pieces -------------------------------- */

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const titleId = useId();
  const descId = useId();
  return (
    <div
      className="workspace-card"
      role="group"
      aria-labelledby={titleId}
      aria-describedby={hint ? descId : undefined}
    >
      <div id={titleId} className="workspace-card-title">
        {title}
      </div>
      {hint && (
        <p id={descId} className="workspace-card-hint">
          {hint}
        </p>
      )}
      {children}
    </div>
  );
}

function Chip({
  active,
  children,
  onClick,
  ariaCurrent,
  icon,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  ariaCurrent?: "page" | "step" | "location" | "date" | "time" | boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`workspace-chip ${active ? "is-active" : ""}`}
      aria-pressed={!!active}
      aria-current={ariaCurrent as any}
    >
      {icon && (
        <span className="workspace-chip-icon" aria-hidden="true">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

function NumberField({
  id,
  value,
  onChange,
  min = 0,
  max = 9999,
  ariaLabel,
}: {
  id?: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  ariaLabel?: string;
}) {
  const commit = useCallback(
    (next: number) => {
      const safe = clamp(isNumber(next) ? next : 0, min, max);
      onChange(safe);
    },
    [min, max, onChange]
  );

  return (
    <div className="workspace-number">
      <button
        onClick={() => commit(value - 1)}
        className="workspace-number-button"
        aria-label="Decrement"
        type="button"
      >
        −
      </button>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => commit(Number(e.target.value || 0))}
        className="workspace-number-input"
        aria-label={ariaLabel}
      />
      <button
        onClick={() => commit(value + 1)}
        className="workspace-number-button"
        aria-label="Increment"
        type="button"
      >
        +
      </button>
    </div>
  );
}

function Range({
  id,
  value,
  onChange,
  min,
  max,
  step,
  format,
  refEl,
  ariaLabel,
}: {
  id?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format?: (v: number) => string;
  refEl?: React.RefObject<HTMLInputElement | null>;
  ariaLabel?: string;
}) {
  const progress01 = (value - min) / (max - min);
  const safeVal = clamp(isNumber(value) ? value : min, min, max);
  return (
    <div className="workspace-range-wrap">
      <div className="workspace-range-header">
        <div className="workspace-range-min" aria-hidden="true">
          {format ? format(min) : min}
        </div>
        <div className="workspace-range-value" aria-live="polite">
          {format ? format(safeVal) : safeVal}
        </div>
        <div className="workspace-range-max" aria-hidden="true">
          {format ? format(max) : max}
        </div>
      </div>
      <input
        id={id}
        ref={refEl as any}
        type="range"
        min={min}
        max={max}
        step={step}
        value={safeVal}
        onChange={(e) => onChange(Number(e.target.value))}
        className="workspace-range"
        style={trackStyle(progress01)}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={safeVal}
        aria-label={ariaLabel}
      />
    </div>
  );
}

/* ------------------------------- Inline Icons ------------------------------ */

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M9.5 12.5l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function LinkCheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M10 13a5 5 0 010-7l1.5-1.5a5 5 0 017 7L17 12"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M14 11a5 5 0 010 7L12.5 19.5a5 5 0 01-7-7L7 10"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M15 16l1.6 1.6L20 14.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SparklesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/* --------- Aliases so callers can import either name if needed --------- */
export { WORKSPACE_SETTINGS_DEFAULTS as SYSTEM_SETTINGS_DEFAULTS };
export type SystemSettings = WorkspaceSettings;
