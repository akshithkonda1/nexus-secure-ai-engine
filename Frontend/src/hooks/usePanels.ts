import { useCallback, useEffect, useState } from "react";

type PanelsState = {
  leftOpen: boolean;
  rightOpen: boolean;
  toggleLeft: () => void;
  toggleRight: () => void;
  setLeft: (v: boolean) => void;
  setRight: (v: boolean) => void;
};

const LS_KEY = "nexus.panels.v1";

export function usePanels(): PanelsState {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<{ leftOpen: boolean; rightOpen: boolean }>;
        if (typeof parsed.leftOpen === "boolean") setLeftOpen(parsed.leftOpen);
        if (typeof parsed.rightOpen === "boolean") setRightOpen(parsed.rightOpen);
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

  return { leftOpen, rightOpen, toggleLeft, toggleRight, setLeft, setRight };
}
