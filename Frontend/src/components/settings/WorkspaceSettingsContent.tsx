import React, { useCallback, useEffect, useMemo, useState } from 'react';
import SaveBar from '../SaveBar';
import Toggle from '../primitives/Toggle';
import LabeledSlider from '../primitives/LabeledSlider';
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

  const spacing = compact ? '1rem' : '1.5rem';
  const sectionGap = compact ? '1.25rem' : '1.75rem';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: sectionGap }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing }}>
        <div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.35rem' }}>Workspace settings</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.65 }}>Tune guardrails, retention, and consensus controls.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {showBackButton && onBack && (
            <button onClick={onBack} className="chatgpt-pill-button" type="button">
              Back to chat
            </button>
          )}
          <button
            type="button"
            className="chatgpt-pill-button"
            onClick={onSave}
            disabled={!dirty || saving}
            style={{ opacity: !dirty || saving ? 0.6 : 1 }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      <section>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Policies</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Toggle
            label={values.privateMode ? 'Private mode' : 'Standard mode'}
            checked={values.privateMode}
            onChange={(next) =>
              setValues((current) => (current ? { ...current, privateMode: next } : current))
            }
          />
          <Toggle
            label={`Redact PII: ${values.redactPII ? 'On' : 'Off'}`}
            checked={values.redactPII}
            onChange={(next) =>
              setValues((current) => (current ? { ...current, redactPII: next } : current))
            }
          />
          <Toggle
            label={`Cross-check: ${values.crossCheck ? 'On' : 'Off'}`}
            checked={values.crossCheck}
            onChange={(next) =>
              setValues((current) => (current ? { ...current, crossCheck: next } : current))
            }
          />
        </div>
      </section>
      <section>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Thresholds</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <LabeledSlider
            label="Consensus threshold"
            value={values.consensus}
            onChange={(next) =>
              setValues((current) => (current ? { ...current, consensus: next } : current))
            }
            min={0.5}
            max={0.95}
            step={0.01}
          />
          <LabeledSlider
            label="Max sources"
            value={values.sources}
            onChange={(next) =>
              setValues((current) => (current ? { ...current, sources: Math.round(next) } : current))
            }
            min={1}
            max={8}
            step={1}
          />
        </div>
      </section>
      <section>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>Behavior</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'flex-end' }}>
          <div>
            <label className="chatgpt-slider-label">Dependable threshold (%)</label>
            <input
              type="range"
              min={60}
              max={95}
              step={1}
              value={values.dependableThresholdPct}
              onChange={(event) =>
                setValues((current) =>
                  current
                    ? { ...current, dependableThresholdPct: parseInt((event.target as HTMLInputElement).value, 10) }
                    : current,
                )
              }
              style={{ width: '100%' }}
            />
            <div className="chatgpt-slider-value">
              {values.dependableThresholdPct}% — below this we augment with web data
            </div>
          </div>
          <div>
            <label className="chatgpt-slider-label">Archive retention (days)</label>
            <input
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
              className="chatgpt-pill-button"
              style={{ width: '100%', textAlign: 'left' }}
            />
            <div className="chatgpt-slider-value">
              Archived/deleted chats purge after {values.retentionDays} day(s)
            </div>
          </div>
        </div>
      </section>
      <SaveBar dirty={dirty} saving={saving} onSave={onSave} onDiscard={onDiscard} />
    </div>
  );
};

export default WorkspaceSettingsContent;
