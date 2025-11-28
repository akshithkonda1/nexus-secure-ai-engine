import { create } from "zustand";
import { requireUserConsent } from "../utils/consent";

export type Connector = {
  id: string;
  label: string;
  source: string;
  consented: boolean;
};

type ConnectorsState = {
  connectors: Connector[];
  addConnector: (label: string, source: string) => Promise<void>;
};

export const useConnectorsStore = create<ConnectorsState>((set, get) => ({
  connectors: [],
  addConnector: async (label, source) => {
    const consented = await requireUserConsent("link-external-content");
    if (!consented) return;

    const newConnector: Connector = {
      id: crypto.randomUUID(),
      label,
      source,
      consented,
    };

    set({ connectors: [...get().connectors, newConnector] });
  },
}));
