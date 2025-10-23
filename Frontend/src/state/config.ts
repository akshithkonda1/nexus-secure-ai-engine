export const CONFIG_STORAGE_KEY = "nexus_cfg_v1";
export type NexusConfig = { retentionDays: number; dependableThresholdPct: number };
const defaults: NexusConfig = { retentionDays: 30, dependableThresholdPct: 80 };

const parseStoredConfig = (): Partial<NexusConfig> => {
  try {
    const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? (parsed as Partial<NexusConfig>) : {};
  } catch {
    return {};
  }
};

export const readConfig = (): NexusConfig => ({
  ...defaults,
  ...parseStoredConfig(),
});

export const readConfigOverrides = (): Partial<NexusConfig> => parseStoredConfig();

export const writeConfig = (patch: Partial<NexusConfig>) => {
  const next = { ...readConfig(), ...patch };
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(next));
  return next;
};
