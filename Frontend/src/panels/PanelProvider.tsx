import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { PanelFlag } from "@/constants/panels";

type PanelsContextValue = {
  leftOpen: boolean;
  rightOpen: boolean;
  toggle: (flag: PanelFlag) => void;
  set: (flag: PanelFlag, value: boolean) => void;
};

const Ctx = createContext<PanelsContextValue | null>(null);
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

  const toggle = useCallback(
    (flag: PanelFlag) => {
      if (flag === PanelFlag.LEFT_OPEN) {
        setLeftOpen((value) => !value);
        return;
      }

      if (flag === PanelFlag.RIGHT_OPEN) {
        setRightOpen((value) => !value);
      }
    },
    [setLeftOpen, setRightOpen]
  );

  const setPanelState = useCallback(
    (flag: PanelFlag, value: boolean) => {
      if (flag === PanelFlag.LEFT_OPEN) {
        setLeftOpen(value);
        return;
      }

      if (flag === PanelFlag.RIGHT_OPEN) {
        setRightOpen(value);
      }
    },
    [setLeftOpen, setRightOpen]
  );

  const value = useMemo(
    () => ({ leftOpen, rightOpen, toggle, set: setPanelState }),
    [leftOpen, rightOpen, toggle, setPanelState]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePanels(): PanelsContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePanels must be used within PanelProvider");
  return ctx;
}
