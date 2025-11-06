import React from "react";

type ThemePref = "light" | "dark" | "system";
type Ctx = {
  pref: ThemePref;
  effective: "light" | "dark";
  setPref: (p: ThemePref) => void;
};

const ThemeCtx = React.createContext<Ctx | undefined>(undefined);
const STORAGE_KEYS = ["nexus-theme", "theme"] as const;

function readPref(): ThemePref {
  try {
    for (const k of STORAGE_KEYS) {
      const v = localStorage.getItem(k);
      if (v === "light" || v === "dark" || v === "system") return v;
    }
  } catch {}
  return "system";
}

function systemDark(): boolean {
  return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

function applyTheme(pref: ThemePref) {
  const eff = pref === "system" ? (systemDark() ? "dark" : "light") : pref;
  const root = document.documentElement;
  root.classList.toggle("dark", eff === "dark");
  root.dataset.theme = eff;
  try {
    for (const k of STORAGE_KEYS) localStorage.setItem(k, pref);
  } catch {}
  return eff;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = React.useState<ThemePref>(() => readPref());
  const [effective, setEffective] = React.useState<"light" | "dark">(() => applyTheme(readPref()));

  // change handler
  const setPref = React.useCallback((p: ThemePref) => {
    setPrefState(p);
    setEffective(applyTheme(p));
    (window as any).__setTheme?.(p);
  }, []);

  // follow OS when on "system"
  React.useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const listener = () => {
      if (pref === "system") setEffective(applyTheme("system"));
    };
    mq.addEventListener ? mq.addEventListener("change", listener) : mq.addListener(listener);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", listener) : mq.removeListener(listener);
    };
  }, [pref]);

  const value = React.useMemo<Ctx>(() => ({ pref, effective, setPref }), [pref, effective, setPref]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
