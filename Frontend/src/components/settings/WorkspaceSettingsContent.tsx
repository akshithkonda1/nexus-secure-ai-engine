import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Gauge, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import SaveBar from '../SaveBar';
import Toggle from '../primitives/Toggle';
import { readConfig, writeConfig } from '../../state/config';

export type WorkspaceSettingsContentProps = {
  showBackButton?: boolean;
  onBack?: () => void;
  compact?: boolean;
};

type WorkspaceSettings = {
  privateMode: boolean;
  redactPII: boolean;
  crossCheck: boolean;
  sources: number;
  consensus: number;
  dependableThresholdPct: number;
  retentionDays: number;
};

const WORKSPACE_SETTINGS_STORAGE_KEY = 'nexus_workspace_settings_v2';

const workspaceDefaults: WorkspaceSettings = {
  privateMode: false,
  redactPII: true,
  crossCheck: true,
  sources: 3,
  consensus: 0.7,
  dependableThresholdPct: 80,
  retentionDays: 30,
};

const loadWorkspaceSettings = (): WorkspaceSettings => {
  const config = readConfig();
  try {
    const stored = JSON.parse(localStorage.getItem(WORKSPACE_SETTINGS_STORAGE_KEY) ?? '{}') as Partial<WorkspaceSettings>;
    return {
      ...workspaceDefaults,
      ...stored,
      dependableThresholdPct: config.dependableThresholdPct,
      retentionDays: config.retentionDays,
    };
  } catch (err) {
    console.warn('Failed to parse stored workspace settings', err);
    return {
      ...workspaceDefaults,
      dependableThresholdPct: config.dependableThresholdPct,
      retentionDays: config.retentionDays,
    };
  }
};

const persistWorkspaceSettings = async (values: WorkspaceSettings): Promise<void> => {
  writeConfig({
    dependableThresholdPct: values.dependableThresholdPct,
    retentionDays: values.retentionDays,
  });
  localStorage.setItem(WORKSPACE_SETTINGS_STORAGE_KEY, JSON.stringify(values));
};

const WorkspaceSettingsContent: React.FC<WorkspaceSettingsContentProps> = ({
  showBackButton = false,
  onBack,
  compact = false,
}) => {
  const [baseline, setBaseline] = useState<WorkspaceSettings | null>(null);
  const [values, setValues] = useState<WorkspaceSettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initial = loadWorkspaceSettings();
    setBaseline(initial);
    setValues(initial);
  }, []);

  const dirty = useMemo(() => {
    if (!baseline || !values) {
      return false;
    }
    return JSON.stringify(values) !== JSON.stringify(baseline);
  }, [baseline, values]);

  const onSave = useCallback(async () => {
    if (!values) {
      return;
    }
    setSaving(true);
    try {
      await persistWorkspaceSettings(values);
      setBaseline({ ...values });
    } catch (error) {
      console.error(error);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  }, [values]);

  const onDiscard = useCallback(() => {
    if (!baseline) {
      return;
    }
    setValues({ ...baseline });
  }, [baseline]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (dirty && !saving) {
          void onSave();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dirty, onSave, saving]);

  if (!values) {
    return <div className="chatgpt-settings-loading">Loading…</div>;
  }

  const consensusPercent = Math.round(values.consensus * 100);

  const policyCards = [
    {
      key: 'privateMode',
      eyebrow: 'Privacy',
      title: 'Workspace visibility',
      description: values.privateMode
        ? 'Restrict access so only invited teammates can review transcripts and controls.'
        : 'Share workspace activity across your organization for faster collaboration.',
      status: values.privateMode ? 'Private mode' : 'Standard mode',
      stateClass: values.privateMode ? 'is-on' : 'is-off',
      toggleLabel: values.privateMode ? 'On' : 'Off',
      checked: values.privateMode,
      onToggle: (next: boolean) =>
        setValues((current) => (current ? { ...current, privateMode: next } : current)),
    },
    {
      key: 'redactPII',
      eyebrow: 'Safety',
      title: 'PII redaction',
      description: values.redactPII
        ? 'Personal identifiers are masked in responses and audit logs.'
        : 'Expose personal identifiers within responses and transcripts.',
      status: values.redactPII ? 'Redaction on' : 'Redaction off',
      stateClass: values.redactPII ? 'is-on' : 'is-off',
      toggleLabel: values.redactPII ? 'On' : 'Off',
      checked: values.redactPII,
      onToggle: (next: boolean) =>
        setValues((current) => (current ? { ...current, redactPII: next } : current)),
    },
    {
      key: 'crossCheck',
      eyebrow: 'Verification',
      title: 'Cross-check answers',
      description: values.crossCheck
        ? 'Responses are validated against trusted sources before delivery.'
        : 'Answers are delivered without additional cross-checking.',
      status: values.crossCheck ? 'Cross-check active' : 'Cross-check off',
      stateClass: values.crossCheck ? 'is-on' : 'is-off',
      toggleLabel: values.crossCheck ? 'On' : 'Off',
      checked: values.crossCheck,
      onToggle: (next: boolean) =>
        setValues((current) => (current ? { ...current, crossCheck: next } : current)),
    },
  ];

  return (
    <div className={`chatgpt-settings ${compact ? 'is-compact' : ''}`}>
      <header className="chatgpt-settings-header">
        <div className="chatgpt-settings-header-copy">
          <span className="chatgpt-settings-badge" aria-hidden="true">
            <ShieldCheck size={18} />
          </span>
          <div>
            <h2 className="chatgpt-settings-title">Workspace settings</h2>
            <p className="chatgpt-settings-subtitle">Tune guardrails, retention, and consensus controls.</p>
          </div>
        </div>
        <div className="chatgpt-settings-actions">
          {showBackButton && onBack && (
            <button onClick={onBack} className="chatgpt-pill-button" type="button">
              Back to chat
            </button>
          )}
          <button
            type="button"
            className="chatgpt-pill-button chatgpt-settings-save"
            onClick={onSave}
            disabled={!dirty || saving}
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </header>

      <section className="chatgpt-settings-section">
        <div className="chatgpt-settings-section-head">
          <span className="chatgpt-settings-section-icon" aria-hidden="true">
            <ShieldCheck size={16} />
          </span>
          <div>
            <h3 className="chatgpt-settings-section-title">Policies</h3>
            <p className="chatgpt-settings-section-subtitle">
              Calibrate privacy, redaction, and verification defaults for your workspace.
            </p>
          </div>
        </div>
        <div className="chatgpt-settings-policy-grid">
          {policyCards.map((card) => (
            <article key={card.key} className="chatgpt-settings-tile">
              <div className="chatgpt-settings-tile-copy">
                <span className="chatgpt-settings-tile-eyebrow">{card.eyebrow}</span>
                <h4 className="chatgpt-settings-tile-title">{card.title}</h4>
                <p className="chatgpt-settings-tile-description">{card.description}</p>
                <span className={`chatgpt-settings-status ${card.stateClass}`}>{card.status}</span>
              </div>
              <Toggle
                label={<span className="chatgpt-toggle-status">{card.toggleLabel}</span>}
                checked={card.checked}
                onChange={card.onToggle}
              />
            </article>
          ))}
        </div>
      </section>

      <section className="chatgpt-settings-section">
        <div className="chatgpt-settings-section-head">
          <span className="chatgpt-settings-section-icon" aria-hidden="true">
            <SlidersHorizontal size={16} />
          </span>
          <div>
            <h3 className="chatgpt-settings-section-title">Thresholds</h3>
            <p className="chatgpt-settings-section-subtitle">
              Balance how confident Nexus should be and how many sources it may cite.
            </p>
          </div>
        </div>
        <div className="chatgpt-settings-matrix">
          <div className="chatgpt-settings-field">
            <div className="chatgpt-settings-field-head">
              <div>
                <label htmlFor="consensus-threshold" className="chatgpt-settings-field-label">
                  Consensus threshold
                </label>
                <p className="chatgpt-settings-field-sub">
                  Require a higher agreement between models before surfacing an answer.
                </p>
              </div>
              <span className="chatgpt-settings-field-value">{consensusPercent}%</span>
            </div>
            <input
              id="consensus-threshold"
              type="range"
              min={0.5}
              max={0.95}
              step={0.01}
              value={values.consensus}
              onChange={(event) =>
                setValues((current) =>
                  current ? { ...current, consensus: parseFloat((event.target as HTMLInputElement).value) } : current,
                )
              }
              className="chatgpt-settings-slider"
              aria-valuemin={0.5}
              aria-valuemax={0.95}
              aria-valuenow={values.consensus}
            />
            <p className="chatgpt-settings-helper">
              Raising the threshold produces more conservative answers with stronger consensus.
            </p>
          </div>
          <div className="chatgpt-settings-field">
            <div className="chatgpt-settings-field-head">
              <div>
                <label htmlFor="max-sources" className="chatgpt-settings-field-label">
                  Max sources
                </label>
                <p className="chatgpt-settings-field-sub">
                  Control how many documents Nexus references in each response.
                </p>
              </div>
              <span className="chatgpt-settings-field-value is-neutral">{values.sources}</span>
            </div>
            <input
              id="max-sources"
              type="range"
              min={1}
              max={8}
              step={1}
              value={values.sources}
              onChange={(event) =>
                setValues((current) =>
                  current
                    ? { ...current, sources: Math.round(parseFloat((event.target as HTMLInputElement).value)) }
                    : current,
                )
              }
              className="chatgpt-settings-slider"
              aria-valuemin={1}
              aria-valuemax={8}
              aria-valuenow={values.sources}
            />
            <p className="chatgpt-settings-helper">
              Higher limits surface more supporting evidence with longer answers.
            </p>
          </div>
        </div>
      </section>

      <section className="chatgpt-settings-section">
        <div className="chatgpt-settings-section-head">
          <span className="chatgpt-settings-section-icon" aria-hidden="true">
            <Gauge size={16} />
          </span>
          <div>
            <h3 className="chatgpt-settings-section-title">Behavior</h3>
            <p className="chatgpt-settings-section-subtitle">
              Shape when Nexus leans on the web and how long your archives stay available.
            </p>
          </div>
        </div>
        <div className="chatgpt-settings-matrix">
          <div className="chatgpt-settings-field">
            <div className="chatgpt-settings-field-head">
              <div>
                <label htmlFor="dependable-threshold" className="chatgpt-settings-field-label">
                  Dependable threshold
                </label>
                <p className="chatgpt-settings-field-sub">
                  Below this confidence Nexus augments answers with real-time web data.
                </p>
              </div>
              <span className="chatgpt-settings-field-value">{values.dependableThresholdPct}%</span>
            </div>
            <input
              id="dependable-threshold"
              type="range"
              min={60}
              max={95}
              step={1}
              value={values.dependableThresholdPct}
              onChange={(event) =>
                setValues((current) =>
                  current
                    ? {
                        ...current,
                        dependableThresholdPct: parseInt((event.target as HTMLInputElement).value, 10),
                      }
                    : current,
                )
              }
              className="chatgpt-settings-slider"
              aria-valuemin={60}
              aria-valuemax={95}
              aria-valuenow={values.dependableThresholdPct}
            />
            <p className="chatgpt-settings-helper">
              {values.dependableThresholdPct}% and below triggers web augmentation for fresher answers.
            </p>
          </div>
          <div className="chatgpt-settings-field">
            <div className="chatgpt-settings-field-head">
              <div>
                <label htmlFor="archive-retention" className="chatgpt-settings-field-label">
                  Archive retention
                </label>
                <p className="chatgpt-settings-field-sub">
                  Define how long deleted or archived chats remain recoverable.
                </p>
              </div>
              <span className="chatgpt-settings-field-value is-neutral">{values.retentionDays} days</span>
            </div>
            <input
              id="archive-retention"
              type="number"
              min={1}
              max={120}
              value={values.retentionDays}
              onChange={(event) =>
                setValues((current) =>
                  current
                    ? {
                        ...current,
                        retentionDays: Math.max(
                          1,
                          Math.min(120, parseInt((event.target as HTMLInputElement).value || '0', 10)),
                        ),
                      }
                    : current,
                )
              }
              className="chatgpt-settings-number"
              aria-describedby="archive-retention-helper"
            />
            <p id="archive-retention-helper" className="chatgpt-settings-helper">
              Archived or deleted chats purge automatically after the selected number of days.
            </p>
          </div>
        </div>
      </section>

      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onDiscard={onDiscard} />
    </div>
  );
};

export default WorkspaceSettingsContent;
