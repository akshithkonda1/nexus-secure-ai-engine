import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

export type NexusConfig = {
  webSearchPercent: number;    // 0-100
  aiModelsPercent: number;     // 0-100
  useBothByDefault: boolean;
  consensusBeforeWebPrime: boolean;
  preferredModel: string;      // id string
  userName: string;
  userEmail: string;
};

const DEFAULTS: NexusConfig = {
  webSearchPercent: 50,
  aiModelsPercent: 50,
  useBothByDefault: true,
  consensusBeforeWebPrime: true,
  preferredModel: "gpt-4o",
  userName: "",
  userEmail: "",
};

const KEY = "nexus.config.v1";

type Ctx = {
  cfg: NexusConfig;
  setCfg: <K extends keyof NexusConfig>(key: K, value: NexusConfig[K]) => void;
  reset: () => void;
};

const ConfigContext = createContext<Ctx | null>(null);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [cfg, setCfgState] = useState<NexusConfig>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
    } catch {
      return DEFAULTS;
    }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch {}
  }, [cfg]);

  const api = useMemo<Ctx>(() => ({
    cfg,
    setCfg: (key, value) => setCfgState(prev => ({ ...prev, [key]: value })),
    reset: () => setCfgState(DEFAULTS),
  }), [cfg]);

  return <ConfigContext.Provider value={api}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error("useConfig must be used within ConfigProvider");
  return ctx;
}
