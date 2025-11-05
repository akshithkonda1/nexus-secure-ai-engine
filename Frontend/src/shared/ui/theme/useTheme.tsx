import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemePref = "light" | "dark" | "system";

type ThemeContextShape = {
  pref: ThemePref;
  effective: "light" | "dark";
  setPref: (t: ThemePref) => void;
};

const STORAGE_KEYS = ["nexus-theme","theme"];
const Ctx = createContext<ThemeContextShape | null>(null);

function readPref(): ThemePref {
  let v: string | null = null;
  try {
    for (const k of STORAGE_KEYS) { v = localStorage.getItem(k); if (v) break; }
  } catch {}
  return (v === "light" || v === "dark" || v === "system") ? (v as ThemePref) : "system";
}

function systemTheme(): "light" | "dark" {
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function apply(theme: "light" | "dark") {
  const root = document.documentElement;
  root.dataset.theme = theme;
  if (theme === "dark") root.classList.add("dark"); else root.classList.remove("dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>(() => readPref());
  const [effective, setEffective] = useState<"light" | "dark">(pref === "system" ? systemTheme() : pref);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      const eff = pref === "system" ? (mql.matches ? "dark" : "light") : pref;
      setEffective(eff);
      apply(eff);
    };
    sync();
    const onChange = () => { if (pref === "system") sync(); };
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else (mql as any).addListener?.(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else (mql as any).removeListener?.(onChange);
    };
  }, [pref]);

  const setPref = (t: ThemePref) => {
    const normalized: ThemePref = (t === "light" || t === "dark" || t === "system") ? t : "system";
    try { for (const k of STORAGE_KEYS) localStorage.setItem(k, normalized); } catch {}
    setPrefState(normalized);
    try { (window as any).__setTheme?.(normalized); } catch {}
  };

  const value = useMemo(() => ({ pref, effective, setPref }), [pref, effective]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme(): ThemeContextShape {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
