import React, { useState } from 'react';
import Card from '../components/primitives/Card';
import Toggle from '../components/primitives/Toggle';
import LabeledSlider from '../components/primitives/LabeledSlider';
import { writeConfig, readConfig } from '../state/config';
const SettingsPage: React.FC<{ onBack: ()=>void }>=({onBack})=>{
  const [privateMode,setPrivateMode]=useState(false);
  const [redactPII,setRedactPII]=useState(true);
  const [crossCheck,setCrossCheck]=useState(true);
  const [sources,setSources]=useState(3);
  const [consensus,setConsensus]=useState(0.7);
  const [cfg,setCfg]=useState(()=>readConfig());
  return (
    <main className="p-6 space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="text-base font-semibold">Settings</div>
          <button onClick={onBack} className="px-3 py-1 rounded-xl card-token">Back to chat</button>
        </div>
        <div className="space-y-6">
          <section>
            <h4 className="text-sm font-semibold mb-2">Policies</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Toggle label={privateMode? 'Private mode' : 'Standard mode'} checked={privateMode} onChange={setPrivateMode} />
              <Toggle label={`Redact PII: ${redactPII? 'On':'Off'}`} checked={redactPII} onChange={setRedactPII} />
              <Toggle label={`Cross-check: ${crossCheck? 'On':'Off'}`} checked={crossCheck} onChange={setCrossCheck} />
            </div>
          </section>
          <section>
            <h4 className="text-sm font-semibold mb-2">Thresholds</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LabeledSlider label="Consensus threshold" value={consensus} onChange={setConsensus} min={0.5} max={0.95} step={0.01} />
              <LabeledSlider label="Max sources" value={sources} onChange={setSources} min={1} max={8} step={1} />
            </div>
          </section>
          <section>
            <h4 className="text-sm font-semibold mb-2">Behavior</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
              <div>
                <label className="text-sm font-medium">Dependable threshold (%)</label>
                <input type="range" min={60} max={95} step={1} value={cfg.dependableThresholdPct} onChange={e=> setCfg(writeConfig({ dependableThresholdPct: parseInt((e.target as HTMLInputElement).value,10) }))} className="w-full mt-2"/>
                <div className="text-xs opacity-70">{cfg.dependableThresholdPct}% — below this we augment with web data</div>
              </div>
              <div>
                <label className="text-sm font-medium">Archive retention (days)</label>
                <input type="number" min={1} max={120} value={cfg.retentionDays} onChange={e=> setCfg(writeConfig({ retentionDays: Math.max(1, Math.min(120, parseInt((e.target as HTMLInputElement).value||'0',10))) }))} className="w-full mt-2 px-2 py-1.5 rounded-xl card-token"/>
                <div className="text-xs opacity-70">Archived/deleted chats purge after {cfg.retentionDays} day(s)</div>
              </div>
            </div>
          </section>
        </div>
      </Card>
    </main>
  );
};
export default SettingsPage;
