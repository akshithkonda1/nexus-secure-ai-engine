import React, { createContext, useContext, useMemo, useState } from "react";
import { WorkspaceRoute } from "../routes";

export type WorkspaceContextValue = {
  route: WorkspaceRoute;
  setRoute: (value: WorkspaceRoute) => void;
  firstLaunch: boolean;
  completeOnboarding: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | undefined>(undefined);

export const WorkspaceProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [route, setRoute] = useState<WorkspaceRoute>("pages");
  const [firstLaunch, setFirstLaunch] = useState(true);

  const completeOnboarding = () => setFirstLaunch(false);

  const value = useMemo(
    () => ({ route, setRoute, firstLaunch, completeOnboarding }),
    [route, firstLaunch]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = (): WorkspaceContextValue => {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return ctx;
};
