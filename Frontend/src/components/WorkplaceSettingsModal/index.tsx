import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Archive,
  CheckCircle2,
  GaugeCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export type WorkspaceSettings = {
  consensusThreshold: number;
  maxSources: number;
  dependableThreshold: number;
  archiveDays: number;
  redactPII: boolean;
  crossCheck: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const sanitizeSettings = (value: WorkspaceSettings): WorkspaceSettings => ({
  consensusThreshold: clamp(Number.isFinite(value.consensusThreshold) ? value.consensusThreshold : 0.7, 0.5, 0.95),
  maxSources: Math.round(clamp(Number.isFinite(value.maxSources) ? value.maxSources : 3, 1, 10)),
  dependableThreshold: clamp(
    Number.isFinite(value.dependableThreshold) ? value.dependableThreshold : 0.9,
    0.6,
    0.99,
  ),
  archiveDays: Math.round(clamp(Number.isFinite(value.archiveDays) ? value.archiveDays : 30, 1, 365)),
  redactPII: Boolean(value.redactPII),
  crossCheck: Boolean(value.crossCheck),
});

export const WORKSPACE_SETTINGS_DEFAULTS: WorkspaceSettings = {
  consensusThreshold: 0.7,
  maxSources: 3,
  dependableThreshold: 0.9,
  archiveDays: 30,
  redactPII: true,
  crossCheck: true,
};

export type WorkplaceSettingsModalProps = {
  open: boolean;
  initial?: Partial<WorkspaceSettings>;
  onClose: () => void;
  onSave: (settings: WorkspaceSettings) => void;
};

type SectionId = "needs" | "wants";

type SectionChip = {
  id: SectionId;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const sectionChips: SectionChip[] = [
  {
    id: "needs",
    label: "Needs",
    description: "Critical guardrails that keep every chat dependable.",
    icon: <ShieldCheck size={16} aria-hidden />, 
  },
  {
    id: "wants",
    label: "Wants",
    description: "Quality-of-life boosts you can toggle as your team evolves.",
    icon: <Sparkles size={16} aria-hidden />, 
  },
];

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

const formatDays = (value: number) => `${value} day${value === 1 ? "" : "s"}`;

export default function WorkplaceSettingsModal({
  open,
  initial,
  onClose,
  onSave,
}: WorkplaceSettingsModalProps) {
  const mergedInitial = useMemo(() => {
    const merged = sanitizeSettings({
      ...WORKSPACE_SETTINGS_DEFAULTS,
      ...(initial ?? {}),
    });
    return merged;
  }, [initial]);

  const [draft, setDraft] = useState<WorkspaceSettings>(mergedInitial);
  const [activeSection, setActiveSection] = useState<SectionId>("needs");
  const baselineRef = useRef<WorkspaceSettings>(mergedInitial);
  const firstInteractiveRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    baselineRef.current = mergedInitial;
    setDraft(mergedInitial);
  }, [mergedInitial]);

  const handleDismiss = useCallback(() => {
    setDraft(baselineRef.current);
    setActiveSection("needs");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleDismiss();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleDismiss]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        firstInteractiveRef.current?.focus();
      });
    }
  }, [open, mergedInitial]);

  const dirty = useMemo(() => {
    const normalizedDraft = sanitizeSettings(draft);
    const baseline = baselineRef.current;
    return JSON.stringify(normalizedDraft) !== JSON.stringify(baseline);
  }, [draft]);

  const statusLabel = dirty ? "Unsaved changes" : "All changes saved";

  if (!open) {
    return null;
  }

  return (
    <div
      className="modal-backdrop workspace-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleDismiss();
        }
      }}
    >
      <div
        className="workspace-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-settings-heading"
      >
        <form
          className="workspace-modal-scroll"
          onSubmit={(event) => {
            event.preventDefault();
            if (!dirty) {
              return;
            }
            const sanitized = sanitizeSettings(draft);
            baselineRef.current = sanitized;
            setDraft(sanitized);
            onSave(sanitized);
          }}
        >
          <div className="workspace-modal-header">
            <div className="workspace-modal-leading">
              <span className="workspace-modal-badge">Control Center</span>
              <div>
                <h2 id="workspace-settings-heading" className="workspace-modal-title">
                  Workspace wants & needs
                </h2>
                <p className="workspace-modal-subtitle">
                  Configure the essentials your team needs to stay trustworthy, then flip on the niceties that help them move faster.
                </p>
              </div>
            </div>
            <div className="workspace-modal-header-actions">
              <button
                type="button"
                className="workspace-modal-close"
                onClick={handleDismiss}
                aria-label="Close settings"
                title="Close"
              >
                ×
              </button>
            </div>
          </div>

          <div className="workspace-modal-body">
            <section className="workspace-section" aria-label="Overview">
              <div className="workspace-overview" role="list">
                <div className="workspace-overview-card" role="listitem">
                  <span className="workspace-overview-label">Consensus</span>
                  <span className="workspace-overview-value">{formatPercent(draft.consensusThreshold)}</span>
                  <span className="workspace-overview-hint">Minimum signal before a response leaves the lab.</span>
                </div>
                <div className="workspace-overview-card" role="listitem">
                  <span className="workspace-overview-label">Sources</span>
                  <span className="workspace-overview-value">{draft.maxSources}</span>
                  <span className="workspace-overview-hint">Maximum concurrent evidence the panel can cite.</span>
                </div>
                <div className="workspace-overview-card" role="listitem">
                  <span className="workspace-overview-label">Retention</span>
                  <span className="workspace-overview-value">{formatDays(draft.archiveDays)}</span>
                  <span className="workspace-overview-hint">Auto-purge policy for transcripts & artifacts.</span>
                </div>
              </div>
            </section>

            <section className="workspace-section" aria-label="Section toggles">
              <div className="workspace-section-header">
                <p className="workspace-section-kicker">Navigator</p>
                <h3 className="workspace-section-title">Wants vs. needs</h3>
                <p className="workspace-section-subtitle">
                  Jump between your non-negotiables and the extras. Everything is grouped so admins can review it in one glance.
                </p>
              </div>
              <div className="workspace-chip-row" role="tablist" aria-label="Settings groups">
                {sectionChips.map((chip, index) => (
                  <button
                    key={chip.id}
                    ref={index === 0 ? firstInteractiveRef : undefined}
                    type="button"
                    className={`workspace-chip${activeSection === chip.id ? " is-active" : ""}`}
                    role="tab"
                    id={`workspace-tab-${chip.id}`}
                    aria-selected={activeSection === chip.id}
                    aria-controls={`workspace-panel-${chip.id}`}
                    title={chip.description}
                    tabIndex={activeSection === chip.id ? 0 : -1}
                    onClick={() => setActiveSection(chip.id)}
                    onKeyDown={(event) => {
                      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
                        return;
                      }
                      event.preventDefault();
                      const direction = event.key === "ArrowRight" ? 1 : -1;
                      const nextIndex = (index + direction + sectionChips.length) % sectionChips.length;
                      const next = sectionChips[nextIndex];
                      setActiveSection(next.id);
                      requestAnimationFrame(() => {
                        document.getElementById(`workspace-tab-${next.id}`)?.focus();
                      });
                    }}
                  >
                    <span className="workspace-chip-icon">{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {activeSection === "needs" ? (
              <section
                className="workspace-section"
                id="workspace-panel-needs"
                role="tabpanel"
                aria-labelledby="workspace-tab-needs"
                tabIndex={0}
              >
                <div className="workspace-section-header">
                  <p className="workspace-section-kicker">Needs</p>
                  <h3 className="workspace-section-title">Trust guardrails</h3>
                  <p className="workspace-section-subtitle">
                    These baselines keep Nexus compliant and dependable. Changes here flow directly to retention and moderation policies.
                  </p>
                </div>
                <div className="workspace-card-grid">
                  <article className="workspace-card">
                    <header className="workspace-number" style={{ justifyContent: "space-between" }}>
                      <span className="workspace-card-title">Consensus floor</span>
                      <GaugeCircle size={18} aria-hidden />
                    </header>
                    <p className="workspace-card-hint">
                      Minimum confidence required before a panel response is released.
                    </p>
                    <label className="workspace-range-value" htmlFor="consensus-threshold">
                      {formatPercent(draft.consensusThreshold)} minimum agreement
                    </label>
                    <input
                      id="consensus-threshold"
                      className="workspace-range"
                      type="range"
                      min={0.5}
                      max={0.95}
                      step={0.01}
                      value={draft.consensusThreshold}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          consensusThreshold: Number((event.target as HTMLInputElement).value),
                        }))
                      }
                    />
                  </article>

                  <article className="workspace-card">
                    <header className="workspace-number" style={{ justifyContent: "space-between" }}>
                      <span className="workspace-card-title">Source ceiling</span>
                      <CheckCircle2 size={18} aria-hidden />
                    </header>
                    <p className="workspace-card-hint">
                      Cap simultaneous citations to keep reviews scannable for auditors.
                    </p>
                    <div className="workspace-number" aria-live="polite">
                      <button
                        type="button"
                        className="workspace-number-button"
                        aria-label="Decrease source limit"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            maxSources: clamp(current.maxSources - 1, 1, 10),
                          }))
                        }
                      >
                        –
                      </button>
                      <input
                        className="workspace-number-input"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={1}
                        max={10}
                        type="number"
                        value={draft.maxSources}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            maxSources: clamp(parseInt(event.target.value || "0", 10), 1, 10),
                          }))
                        }
                        aria-label="Maximum sources"
                      />
                      <button
                        type="button"
                        className="workspace-number-button"
                        aria-label="Increase source limit"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            maxSources: clamp(current.maxSources + 1, 1, 10),
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  </article>

                  <article className="workspace-card">
                    <header className="workspace-number" style={{ justifyContent: "space-between" }}>
                      <span className="workspace-card-title">Dependable threshold</span>
                      <ShieldCheck size={18} aria-hidden />
                    </header>
                    <p className="workspace-card-hint">
                      Below this line we escalate for extra verification or defer to research mode.
                    </p>
                    <label className="workspace-range-value" htmlFor="dependable-threshold">
                      {formatPercent(draft.dependableThreshold)} dependable confidence
                    </label>
                    <input
                      id="dependable-threshold"
                      className="workspace-range"
                      type="range"
                      min={0.6}
                      max={0.99}
                      step={0.01}
                      value={draft.dependableThreshold}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          dependableThreshold: Number((event.target as HTMLInputElement).value),
                        }))
                      }
                    />
                  </article>

                  <article className="workspace-card">
                    <header className="workspace-number" style={{ justifyContent: "space-between" }}>
                      <span className="workspace-card-title">Retention policy</span>
                      <Archive size={18} aria-hidden />
                    </header>
                    <p className="workspace-card-hint">
                      Define how long chat transcripts and uploads stick around before purge jobs run.
                    </p>
                    <div className="workspace-number" aria-live="polite">
                      <button
                        type="button"
                        className="workspace-number-button"
                        aria-label="Decrease archive days"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            archiveDays: clamp(current.archiveDays - 1, 1, 365),
                          }))
                        }
                      >
                        –
                      </button>
                      <input
                        className="workspace-number-input"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min={1}
                        max={365}
                        type="number"
                        value={draft.archiveDays}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            archiveDays: clamp(parseInt(event.target.value || "0", 10), 1, 365),
                          }))
                        }
                        aria-label="Archive retention in days"
                      />
                      <button
                        type="button"
                        className="workspace-number-button"
                        aria-label="Increase archive days"
                        onClick={() =>
                          setDraft((current) => ({
                            ...current,
                            archiveDays: clamp(current.archiveDays + 1, 1, 365),
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  </article>
                </div>
              </section>
            ) : (
              <section
                className="workspace-section"
                id="workspace-panel-wants"
                role="tabpanel"
                aria-labelledby="workspace-tab-wants"
                tabIndex={0}
              >
                <div className="workspace-section-header">
                  <p className="workspace-section-kicker">Wants</p>
                  <h3 className="workspace-section-title">Quality boosters</h3>
                  <p className="workspace-section-subtitle">
                    Optional assists that make Nexus feel delightful without compromising the guardrails above.
                  </p>
                </div>
                <div className="workspace-card-grid">
                  <article className="workspace-card">
                    <header className="workspace-number" style={{ justifyContent: "space-between" }}>
                      <span className="workspace-card-title">Redact PII</span>
                      <ShieldCheck size={18} aria-hidden />
                    </header>
                    <p className="workspace-card-hint">
                      Automatically mask personal information before storing transcripts or sharing outputs.
                    </p>
                    <ToggleRow
                      id="redact-pii"
                      checked={draft.redactPII}
                      onChange={(next) =>
                        setDraft((current) => ({
                          ...current,
                          redactPII: next,
                        }))
                      }
                      labelOn="Redaction enabled"
                      labelOff="Redaction disabled"
                    />
                  </article>

                  <article className="workspace-card">
                    <header className="workspace-number" style={{ justifyContent: "space-between" }}>
                      <span className="workspace-card-title">Cross-check panel</span>
                      <Sparkles size={18} aria-hidden />
                    </header>
                    <p className="workspace-card-hint">
                      Send low-confidence answers to a secondary review panel before the user ever sees them.
                    </p>
                    <ToggleRow
                      id="cross-check"
                      checked={draft.crossCheck}
                      onChange={(next) =>
                        setDraft((current) => ({
                          ...current,
                          crossCheck: next,
                        }))
                      }
                      labelOn="Secondary review on"
                      labelOff="Secondary review off"
                    />
                  </article>
                </div>
              </section>
            )}
          </div>

          <footer className="workspace-modal-footer">
            <div className="workspace-modal-status" aria-live="polite">
              {statusLabel}
            </div>
            <div className="workspace-modal-actions">
              <button
                type="button"
                className="workspace-modal-reset"
                onClick={() => {
                  const reset = baselineRef.current;
                  setDraft(reset);
                  setActiveSection("needs");
                }}
                disabled={!dirty}
              >
                Reset
              </button>
              <button type="submit" className="workspace-modal-save" disabled={!dirty}>
                Save changes
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}

type ToggleRowProps = {
  id: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  labelOn: string;
  labelOff: string;
};

function ToggleRow({ id, checked, onChange, labelOn, labelOff }: ToggleRowProps) {
  return (
    <div className="workspace-toggle" role="group" aria-labelledby={`${id}-label`}>
      <div className="workspace-toggle-content">
        <span id={`${id}-label`} className="workspace-toggle-label">
          {checked ? labelOn : labelOff}
        </span>
      </div>
      <button
        type="button"
        className={`workspace-toggle-button${checked ? " is-active" : ""}`}
        aria-pressed={checked}
        aria-label={checked ? `${labelOn}. Toggle off.` : `${labelOff}. Toggle on.`}
        onClick={() => onChange(!checked)}
      >
        <span className="workspace-toggle-thumb" aria-hidden />
      </button>
    </div>
  );
}
