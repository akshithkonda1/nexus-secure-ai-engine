import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Panels = {
  leftOpen: boolean;
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
  setLeft: (v: boolean) => void;
  setRight: (v: boolean) => void;
};

const Ctx = createContext<Panels | null>(null);
const LS_KEY = "nexus.panels.v1";

export function PanelProvider({ children }: { children: ReactNode }) {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{ leftOpen: boolean; rightOpen: boolean }>;
        if (typeof parsed.leftOpen === "boolean") setLeftOpen(parsed.leftOpen);
        if (typeof parsed.rightOpen === "boolean") setRightOpen(parsed.rightOpen);
      } else {
        if (window.matchMedia("(max-width: 1024px)").matches) {
          setLeftOpen(false);
          setRightOpen(false);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ leftOpen, rightOpen }));
    } catch {}
  }, [leftOpen, rightOpen]);

  const toggleLeft = useCallback(() => setLeftOpen((v) => !v), []);
  const toggleRight = useCallback(() => setRightOpen((v) => !v), []);
  const setLeft = useCallback((v: boolean) => setLeftOpen(v), []);
  const setRight = useCallback((v: boolean) => setRightOpen(v), []);

  const value = useMemo(
    () => ({ leftOpen, rightOpen, toggleLeft, toggleRight, setLeft, setRight }),
    [leftOpen, rightOpen, toggleLeft, toggleRight, setLeft, setRight]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePanels(): Panels {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePanels must be used within PanelProvider");
  return ctx;
}
