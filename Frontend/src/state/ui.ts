import { create } from "zustand";
import {
  ToronInteractionContext,
  ToronInteractionEventPayload,
  createDefaultToronContext,
} from "../components/toron/engine/types";
import {
  onToronError,
  onToronIdle,
  onToronResponding,
  onToronThinking,
  onUserSubmit,
  onUserTyping,
} from "../components/toron/engine/interactionEvents";

interface UIState {
  isCommandCenterOpen: boolean;
  openCommandCenter: () => void;
  closeCommandCenter: () => void;

  toronContext: ToronInteractionContext;
  setToronContext: (ctx: ToronInteractionContext) => void;
  handleToronTyping: (payload: ToronInteractionEventPayload) => void;
  handleToronSubmit: (payload: ToronInteractionEventPayload) => void;
  handleToronThinking: (payload: ToronInteractionEventPayload) => void;
  handleToronResponding: (payload: ToronInteractionEventPayload) => void;
  handleToronIdle: (payload: ToronInteractionEventPayload) => void;
  handleToronError: (payload: ToronInteractionEventPayload) => void;
}

export const useUI = create<UIState>((set, get) => ({
  isCommandCenterOpen: false,
  openCommandCenter: () => set({ isCommandCenterOpen: true }),
  closeCommandCenter: () => set({ isCommandCenterOpen: false }),

  toronContext: createDefaultToronContext(),
  setToronContext: (ctx: ToronInteractionContext) => set({ toronContext: ctx }),
  handleToronTyping: (payload: ToronInteractionEventPayload) =>
    set({ toronContext: onUserTyping(payload, get().toronContext) }),
  handleToronSubmit: (payload: ToronInteractionEventPayload) =>
    set({ toronContext: onUserSubmit(payload, get().toronContext) }),
  handleToronThinking: (payload: ToronInteractionEventPayload) =>
    set({ toronContext: onToronThinking(payload, get().toronContext) }),
  handleToronResponding: (payload: ToronInteractionEventPayload) =>
    set({ toronContext: onToronResponding(payload, get().toronContext) }),
  handleToronIdle: (payload: ToronInteractionEventPayload) =>
    set({ toronContext: onToronIdle(payload, get().toronContext) }),
  handleToronError: (payload: ToronInteractionEventPayload) =>
    set({ toronContext: onToronError(payload, get().toronContext) }),
}));
