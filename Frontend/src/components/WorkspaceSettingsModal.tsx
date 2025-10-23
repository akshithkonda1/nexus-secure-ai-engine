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
 * WorkspaceSettingsModal.tsx — world-class render
 * ---------------------------------------------------------------------------
 * ✔ Portal to <body> + background scroll-lock
 * ✔ Focus trap + restore prior focus + initial autofocus
 * ✔ Escape to close; ⌘/Ctrl+S or ⌘/Ctrl+Enter to Save; Shift+Escape to Discard
 * ✔ Full ARIA (role="dialog", labelledby/ describedby)
 * ✔ Dirty detection; Save/Discard actions disabled states
 * ✔ Strong input validation + clamping
 * ✔ Reduced-motion support; click-outside to close (backdrop)
 * ✔ Range/Number controls with accessible labelling
 * ✔ Keyboard-only affordances + screen-reader text helpers
 */

/* ----------------------------- Types & Defaults ---------------------------- */

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

/* --------------------------------- Utils ---------------------------------- */

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

/** Visually hidden text (for screen readers). */
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

/** Gradient for the range track showing progress. */
function trackStyle(progress01: number) {
  const pct = clamp(progress01, 0, 1) * 100;
  return {
    background: `linear-gradient(90deg, rgb(24,24,27) 0%, rgb(24,24,27) ${pct}%, rgb(63,63,70) ${pct}%, rgb(63,63,70) 100%)`,
  } as React.CSSProperties;
}

/* --------------------------------- Modal ---------------------------------- */

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
  // Merge defaults + caller overrides
  const merged = useMemo<WorkspaceSettings>(
    () => ({ ...WORKSPACE_SETTINGS_DEFAULTS, ...initial }),
    [initial]
  );

  const [settings, setSettings] = useState<WorkspaceSettings>(merged);
  useEffect(() => {
    if (open) setSettings(merged);
  }, [merged, open]);

  const dirty = useDirty(settings, merged);

  // ids for aria ties
  const titleId = useId();
  const descId = useId();

  // focus management
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

  // trap focus within dialog
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // initial focus
    const t = setTimeout(() => {
      (firstControlRef.current ?? dialogRef.current)?.focus();
    }, 0);

    // trap
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
      // restore prior focus
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // global hotkeys (Esc to close; Shift+Esc to discard; ⌘/Ctrl+S or ⌘/Ctrl+Enter to save)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      // Save
      if (meta && (e.key.toLowerCase() === "s" || e.key === "Enter")) {
        e.preventDefault();
        if (dirty) onSave(settings);
        onClose();
        return;
      }

      // Discard
      if (e.shiftKey && e.key === "Escape") {
        e.preventDefault();
        if (dirty) setSettings(merged);
        onClose();
        return;
      }

      // Close
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dirty, merged, settings, onClose, onSave]);

  // nothing to render
  if (!open) return null;

  const saveAndClose = () => {
    if (dirty) onSave(settings);
    onClose();
  };
  const discardAndStay = () => {
    if (dirty) setSettings(merged);
  };

  const body = (
    <div
      className="modal-backdrop workspace-modal-backdrop"
      aria-hidden="false"
      onClick={onClose}
    >
      <section
        ref={dialogRef as any}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className={[
          "workspace-modal",
          prefersReducedMotion ? "rm" : "animate-in",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* scrollable shell */}
        <div className="workspace-modal-scroll">
          {/* Header (sticky) */}
          <header className="workspace-modal-header">
            <div>
              <h2 id={titleId} className="workspace-modal-title">
                Workspace settings
              </h2>
              <p id={descId} className="workspace-modal-subtitle">
                Tune guardrails, retention, and consensus controls.
              </p>
            </div>
            <button
              onClick={saveAndClose}
              disabled={!dirty}
              aria-disabled={!dirty}
              className="workspace-modal-save"
              type="button"
            >
              Save
              <VisuallyHidden> settings</VisuallyHidden>
            </button>
          </header>

          {/* Body */}
          <div className="workspace-modal-body">
            {/* Policies */}
            <section className="workspace-section">
              <div className="workspace-section-title">Policies</div>
              <div className="workspace-chip-row">
                <Chip active ariaCurrent="page">
                  Standard mode
                </Chip>
                <Chip
                  active={settings.redactPII}
                  onClick={() =>
                    setSettings((s) => ({ ...s, redactPII: !s.redactPII }))
                  }
                >
                  Redact PII: {settings.redactPII ? "On" : "Off"}
                </Chip>
                <Chip
                  active={settings.crossCheck}
                  onClick={() =>
                    setSettings((s) => ({ ...s, crossCheck: !s.crossCheck }))
                  }
                >
                  Cross-check: {settings.crossCheck ? "On" : "Off"}
                </Chip>
              </div>
            </section>

            {/* Thresholds */}
            <section className="workspace-section">
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
                      setSettings((s) => ({
                        ...s,
                        consensusThreshold: clamp(v, 0, 1),
                      }))
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
                      setSettings((s) => ({
                        ...s,
                        maxSources: Math.round(clamp(v, 1, 10)),
                      }))
                    }
                    format={(v) => v.toFixed(0)}
                    ariaLabel="Maximum sources"
                  />
                </Card>
              </div>
            </section>

            {/* Behavior */}
            <section className="workspace-section">
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
                      setSettings((s) => ({
                        ...s,
                        dependableThreshold: clamp(v, 0, 1),
                      }))
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
                      setSettings((s) => ({
                        ...s,
                        archiveDays: clamp(Math.round(n), 0, 3650),
                      }))
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

        {/* Footer (sticky) */}
        <footer className="workspace-modal-footer">
          <div
            className="workspace-modal-status"
            aria-live="polite"
            aria-atomic="true"
          >
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

  // Render in a portal to avoid stacking/context issues
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
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  /** pass ariaCurrent="page" for the current mode chip */
  ariaCurrent?: "page" | "step" | "location" | "date" | "time" | boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`workspace-chip ${active ? "is-active" : ""}`}
      aria-pressed={!!active}
      aria-current={ariaCurrent as any}
    >
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
 * WorkspaceSettingsModal.tsx — world-class render
 * ---------------------------------------------------------------------------
 * ✔ Portal to <body> + background scroll-lock
 * ✔ Focus trap + restore prior focus + initial autofocus
 * ✔ Escape to close; ⌘/Ctrl+S or ⌘/Ctrl+Enter to Save; Shift+Escape to Discard
 * ✔ Full ARIA (role="dialog", labelledby/ describedby)
 * ✔ Dirty detection; Save/Discard actions disabled states
 * ✔ Strong input validation + clamping
 * ✔ Reduced-motion support; click-outside to close (backdrop)
 * ✔ Range/Number controls with accessible labelling
 * ✔ Keyboard-only affordances + screen-reader text helpers
 */

/* ----------------------------- Types & Defaults ---------------------------- */

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

/* --------------------------------- Utils ---------------------------------- */

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

/** Visually hidden text (for screen readers). */
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

/** Gradient for the range track showing progress. */
function trackStyle(progress01: number) {
  const pct = clamp(progress01, 0, 1) * 100;
  return {
    background: `linear-gradient(90deg, rgb(24,24,27) 0%, rgb(24,24,27) ${pct}%, rgb(63,63,70) ${pct}%, rgb(63,63,70) 100%)`,
  } as React.CSSProperties;
}

/* --------------------------------- Modal ---------------------------------- */

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
  // Merge defaults + caller overrides
  const merged = useMemo<WorkspaceSettings>(
    () => ({ ...WORKSPACE_SETTINGS_DEFAULTS, ...initial }),
    [initial]
  );

  const [settings, setSettings] = useState<WorkspaceSettings>(merged);
  useEffect(() => {
    if (open) setSettings(merged);
  }, [merged, open]);

  const dirty = useDirty(settings, merged);

  // ids for aria ties
  const titleId = useId();
  const descId = useId();

  // focus management
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

  // trap focus within dialog
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    // initial focus
    const t = setTimeout(() => {
      (firstControlRef.current ?? dialogRef.current)?.focus();
    }, 0);

    // trap
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
      // restore prior focus
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // global hotkeys (Esc to close; Shift+Esc to discard; ⌘/Ctrl+S or ⌘/Ctrl+Enter to save)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;

      // Save
      if (meta && (e.key.toLowerCase() === "s" || e.key === "Enter")) {
        e.preventDefault();
        if (dirty) onSave(settings);
        onClose();
        return;
      }

      // Discard
      if (e.shiftKey && e.key === "Escape") {
        e.preventDefault();
        if (dirty) setSettings(merged);
        onClose();
        return;
      }

      // Close
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, dirty, merged, settings, onClose, onSave]);

  // nothing to render
  if (!open) return null;

  const saveAndClose = () => {
    if (dirty) onSave(settings);
    onClose();
  };
  const discardAndStay = () => {
    if (dirty) setSettings(merged);
  };

  const body = (
    <div
      className="modal-backdrop workspace-modal-backdrop"
      aria-hidden="false"
      onClick={onClose}
    >
      <section
        ref={dialogRef as any}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className={[
          "workspace-modal",
          prefersReducedMotion ? "rm" : "animate-in",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {/* scrollable shell */}
        <div className="workspace-modal-scroll">
          {/* Header (sticky) */}
          <header className="workspace-modal-header">
            <div>
              <h2 id={titleId} className="workspace-modal-title">
                Workspace settings
              </h2>
              <p id={descId} className="workspace-modal-subtitle">
                Tune guardrails, retention, and consensus controls.
              </p>
            </div>
            <button
              onClick={saveAndClose}
              disabled={!dirty}
              aria-disabled={!dirty}
              className="workspace-modal-save"
              type="button"
            >
              Save
              <VisuallyHidden> settings</VisuallyHidden>
            </button>
          </header>

          {/* Body */}
          <div className="workspace-modal-body">
            {/* Policies */}
            <section className="workspace-section">
              <div className="workspace-section-title">Policies</div>
              <div className="workspace-chip-row">
                <Chip active ariaCurrent="page">
                  Standard mode
                </Chip>
                <Chip
                  active={settings.redactPII}
                  onClick={() =>
                    setSettings((s) => ({ ...s, redactPII: !s.redactPII }))
                  }
                >
                  Redact PII: {settings.redactPII ? "On" : "Off"}
                </Chip>
                <Chip
                  active={settings.crossCheck}
                  onClick={() =>
                    setSettings((s) => ({ ...s, crossCheck: !s.crossCheck }))
                  }
                >
                  Cross-check: {settings.crossCheck ? "On" : "Off"}
                </Chip>
              </div>
            </section>

            {/* Thresholds */}
            <section className="workspace-section">
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
                      setSettings((s) => ({
                        ...s,
                        consensusThreshold: clamp(v, 0, 1),
                      }))
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
                      setSettings((s) => ({
                        ...s,
                        maxSources: Math.round(clamp(v, 1, 10)),
                      }))
                    }
                    format={(v) => v.toFixed(0)}
                    ariaLabel="Maximum sources"
                  />
                </Card>
              </div>
            </section>

            {/* Behavior */}
            <section className="workspace-section">
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
                      setSettings((s) => ({
                        ...s,
                        dependableThreshold: clamp(v, 0, 1),
                      }))
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
                      setSettings((s) => ({
                        ...s,
                        archiveDays: clamp(Math.round(n), 0, 3650),
                      }))
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

        {/* Footer (sticky) */}
        <footer className="workspace-modal-footer">
          <div
            className="workspace-modal-status"
            aria-live="polite"
            aria-atomic="true"
          >
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

  // Render in a portal to avoid stacking/context issues
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
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  /** pass ariaCurrent="page" for the current mode chip */
  ariaCurrent?: "page" | "step" | "location" | "date" | "time" | boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`workspace-chip ${active ? "is-active" : ""}`}
      aria-pressed={!!active}
      aria-current={ariaCurrent as any}
    >
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
