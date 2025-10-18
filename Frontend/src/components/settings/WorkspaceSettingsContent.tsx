import React, { useState } from 'react';
import Toggle from '../primitives/Toggle';
import LabeledSlider from '../primitives/LabeledSlider';
import { readConfig, writeConfig } from '../../state/config';

export type WorkspaceSettingsContentProps = {
  showBackButton?: boolean;
  onBack?: ()=>void;
  compact?: boolean;
};

const WorkspaceSettingsContent: React.FC<WorkspaceSettingsContentProps> = ({ showBackButton=false, onBack, compact=false }) => {
  const [privateMode,setPrivateMode]=useState(false);
  const [redactPII,setRedactPII]=useState(true);
  const [crossCheck,setCrossCheck]=useState(true);
  const [sources,setSources]=useState(3);
  const [consensus,setConsensus]=useState(0.7);
  const [cfg,setCfg]=useState(()=>readConfig());

  const spacing=compact? '1rem' : '1.5rem';
  const sectionGap=compact? '1.25rem' : '1.75rem';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:sectionGap }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:spacing }}>
        <div>
          <div style={{ fontSize:'1.1rem', fontWeight:700, marginBottom:'0.35rem' }}>Workspace settings</div>
          <div style={{ fontSize:'0.85rem', opacity:0.65 }}>Tune guardrails, retention, and consensus controls.</div>
        </div>
        {showBackButton && onBack && (
          <button onClick={onBack} className="chatgpt-pill-button">Back to chat</button>
        )}
      </div>
      <section>
        <h4 style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:'0.75rem' }}>Policies</h4>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.75rem' }}>
          <Toggle label={privateMode? 'Private mode' : 'Standard mode'} checked={privateMode} onChange={setPrivateMode} />
          <Toggle label={`Redact PII: ${redactPII? 'On':'Off'}`} checked={redactPII} onChange={setRedactPII} />
          <Toggle label={`Cross-check: ${crossCheck? 'On':'Off'}`} checked={crossCheck} onChange={setCrossCheck} />
        </div>
      </section>
      <section>
        <h4 style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:'0.75rem' }}>Thresholds</h4>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:'1rem' }}>
          <LabeledSlider label="Consensus threshold" value={consensus} onChange={setConsensus} min={0.5} max={0.95} step={0.01} />
          <LabeledSlider label="Max sources" value={sources} onChange={setSources} min={1} max={8} step={1} />
        </div>
      </section>
      <section>
        <h4 style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:'0.75rem' }}>Behavior</h4>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:'1.25rem', alignItems:'flex-end' }}>
          <div>
            <label className="chatgpt-slider-label">Dependable threshold (%)</label>
            <input
              type="range"
              min={60}
              max={95}
              step={1}
              value={cfg.dependableThresholdPct}
              onChange={e=> setCfg(writeConfig({ dependableThresholdPct: parseInt((e.target as HTMLInputElement).value,10) }))}
              style={{ width:'100%' }}
            />
            <div className="chatgpt-slider-value">{cfg.dependableThresholdPct}% — below this we augment with web data</div>
          </div>
          <div>
            <label className="chatgpt-slider-label">Archive retention (days)</label>
            <input
              type="number"
              min={1}
              max={120}
              value={cfg.retentionDays}
              onChange={e=> setCfg(writeConfig({ retentionDays: Math.max(1, Math.min(120, parseInt((e.target as HTMLInputElement).value||'0',10))) }))}
              className="chatgpt-pill-button"
              style={{ width:'100%', textAlign:'left' }}
            />
            <div className="chatgpt-slider-value">Archived/deleted chats purge after {cfg.retentionDays} day(s)</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WorkspaceSettingsContent;
