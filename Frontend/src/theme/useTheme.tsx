import React from "react";

type ThemePref = "light" | "dark" | "system";
type ThemeCtx = {
  pref: ThemePref;
  effective: "light" | "dark";
  setPref: (p: ThemePref) => void;
};

const Ctx = React.createContext<ThemeCtx | undefined>(undefined);
const KEYS = ["theme", "nexus-theme"] as const;

function readPref(): ThemePref {
  try {
    for (const k of KEYS) {
      const v = localStorage.getItem(k);
      if (v === "light" || v === "dark" || v === "system") return v;
    }
  } catch {}
  return "dark"; // default to DARK
}

function systemDark(): boolean {
  return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
}

function applyTheme(pref: ThemePref) {
  const eff = pref === "system" ? (systemDark() ? "dark" : "light") : pref;
  const root = document.documentElement;
  root.classList.toggle("dark", eff === "dark");
  root.dataset.theme = eff;
  try { localStorage.setItem("theme", pref); } catch {}
  return eff;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = React.useState<ThemePref>(() => readPref());
  const [effective, setEffective] = React.useState<"light" | "dark">(() => applyTheme(readPref()));

  const setPref = React.useCallback((p: ThemePref) => {
    setPrefState(p);
    setEffective(applyTheme(p));
    (window as any).__setTheme?.(p); // keep index.html script in sync
  }, []);

  React.useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const onChange = () => { if (pref === "system") setEffective(applyTheme("system")); };
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange);
    };
  }, [pref]);

  const value = React.useMemo(() => ({ pref, effective, setPref }), [pref, effective, setPref]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
