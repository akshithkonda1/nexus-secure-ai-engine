import React from "react";

type Pref = "light" | "dark" | "system";
type Ctx = { pref: Pref; effective: "light" | "dark"; setPref: (p: Pref) => void };

const ThemeCtx = React.createContext<Ctx | undefined>(undefined);

function systemDark(): boolean {
  return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
}
function readPref(): Pref {
  try {
    const v = localStorage.getItem("theme") || localStorage.getItem("nexus-theme");
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {}
  return "dark";
}
function apply(pref: Pref): "light" | "dark" {
  const eff = pref === "system" ? (systemDark() ? "dark" : "light") : pref;
  const root = document.documentElement;
  root.classList.toggle("dark", eff === "dark");
  root.dataset.theme = eff;
  try { localStorage.setItem("theme", pref); } catch {}
  // keep the early script in sync if present
  (window as any).__setTheme && (window as any).__setTheme(pref);
  return eff;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // resolve synchronously; NO side effects on mount later
  const initial = readPref();
  const [pref, setPrefState] = React.useState<Pref>(initial);
  const [effective, setEffective] = React.useState<"light" | "dark">(() => apply(initial));

  const setPref = React.useCallback((p: Pref) => {
    setPrefState(p);
    setEffective(apply(p));
  }, []);

  React.useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const onChange = () => { if (pref === "system") setEffective(apply("system")); };
    mq.addEventListener ? mq.addEventListener("change", onChange) : mq.addListener(onChange);
    return () => {
      mq.removeEventListener ? mq.removeEventListener("change", onChange) : mq.removeListener(onChange);
    };
  }, [pref]);

  const value = React.useMemo(() => ({ pref, effective, setPref }), [pref, effective, setPref]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}
