import { create } from "zustand";

interface FeedbackState {
  open: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useFeedback = create<FeedbackState>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  closeModal: () => set({ open: false }),
}));
