import { create } from "zustand";

type Notification = {
  id: string;
  title: string;
  detail: string;
};

type NotificationsState = {
  actionable: Notification[];
  insights: Notification[];
  addActionable: (item: Notification) => void;
  addInsight: (item: Notification) => void;
};

export const useNotificationsStore = create<NotificationsState>((set) => ({
  actionable: [],
  insights: [
    {
      id: "insight-1",
      title: "Patterns detected",
      detail: "You tend to capture tasks late at night. Consider batching earlier in the day.",
    },
  ],
  addActionable: (item) => set((state) => ({ actionable: [...state.actionable, item] })),
  addInsight: (item) => set((state) => ({ insights: [...state.insights, item] })),
}));
