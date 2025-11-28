import React, { createContext, useContext, useEffect } from "react";
import { useModeStore } from "../../state/modeStore";

type ModeContextValue = ReturnType<typeof useModeStore>;

const ModeContext = createContext<ModeContextValue | undefined>(undefined);

export const ModeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const store = useModeStore();

  useEffect(() => {
    document.documentElement.dataset.workspaceMode = store.mode;
  }, [store.mode]);

  return <ModeContext.Provider value={store}>{children}</ModeContext.Provider>;
};

export const useMode = (): ModeContextValue => {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    throw new Error("useMode must be used within ModeProvider");
  }
  return ctx;
};
