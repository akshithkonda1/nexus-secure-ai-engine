import { create } from "zustand";

export type ToronCard = {
  id: string;
  title: string;
  reason: string;
  onAccept?: (id: string) => void;
  onIgnore?: (id: string) => void;
  onExplain?: (id: string) => void;
};

type ToronState = {
  isModalOpen: boolean;
  cards: ToronCard[];
  openToron: () => void;
  closeToron: () => void;
};

export const useToronStore = create<ToronState>((set) => ({
  isModalOpen: false,
  cards: [
    {
      id: "duplicate-tasks",
      title: "Possible duplicate tasks",
      reason: "Two tasks look similar. Toron can consolidate them for clarity.",
    },
    {
      id: "schedule-balance",
      title: "Schedule balancing",
      reason: "Your week has two heavy days. Toron recommends moving one task to Friday.",
    },
  ],
  openToron: () => set({ isModalOpen: true }),
  closeToron: () => set({ isModalOpen: false }),
}));
