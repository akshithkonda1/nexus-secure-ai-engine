import { create } from "zustand";

export type ModalKey =
  | "profile"
  | "billing-waitlist"
  | "feedback"
  | "refer";

type ModalState = {
  openKey: ModalKey | null;
  open: (key: ModalKey) => void;
  close: () => void;
};

export const useModal = create<ModalState>((set) => ({
  openKey: null,
  open: (key) => set({ openKey: key }),
  close: () => set({ openKey: null }),
}));
