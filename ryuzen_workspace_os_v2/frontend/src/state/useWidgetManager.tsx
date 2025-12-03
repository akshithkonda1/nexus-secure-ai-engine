import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type WidgetName = "lists" | "calendar" | "connectors" | "tasks" | null;

interface WidgetManagerContext {
  currentWidget: WidgetName;
  openWidget: (name: Exclude<WidgetName, null>) => void;
  closeWidget: () => void;
}

const WidgetManager = createContext<WidgetManagerContext | undefined>(undefined);

export const WidgetManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWidget, setCurrentWidget] = useState<WidgetName>(null);

  const openWidget = useCallback((name: Exclude<WidgetName, null>) => {
    setCurrentWidget(name);
  }, []);

  const closeWidget = useCallback(() => {
    setCurrentWidget(null);
  }, []);

  const value = useMemo(
    () => ({
      currentWidget,
      openWidget,
      closeWidget,
    }),
    [closeWidget, currentWidget, openWidget]
  );

  return <WidgetManager.Provider value={value}>{children}</WidgetManager.Provider>;
};

export const useWidgetManager = () => {
  const context = useContext(WidgetManager);
  if (!context) {
    throw new Error("useWidgetManager must be used within WidgetManagerProvider");
  }
  return context;
};

export type { WidgetName };
