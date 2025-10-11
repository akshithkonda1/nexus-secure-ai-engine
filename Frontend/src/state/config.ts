const LS_CFG = 'nexus_cfg_v1';
export type NexusConfig = { retentionDays: number; dependableThresholdPct: number; };
const defaults: NexusConfig = { retentionDays: 30, dependableThresholdPct: 80 };
export const readConfig = (): NexusConfig => {
  try { return { ...defaults, ...(JSON.parse(localStorage.getItem(LS_CFG) || '{}')||{}) }; } catch { return defaults; }
};
export const writeConfig = (patch: Partial<NexusConfig>) => {
  const next = { ...readConfig(), ...patch };
  localStorage.setItem(LS_CFG, JSON.stringify(next));
  return next;
};
