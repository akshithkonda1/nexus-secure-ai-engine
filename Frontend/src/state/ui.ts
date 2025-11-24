import { create } from "zustand";
import { CompiledContext, ShapedContextMetadata } from "@/components/toron/context/types";

interface UIState {
  isCommandCenterOpen: boolean;
  contextSnapshot?: {
    phase: CompiledContext["conversationPhase"];
    continuity: number;
    emotionalTemperature: number;
    safetyBias: number;
  };
  openCommandCenter: () => void;
  closeCommandCenter: () => void;
  setContextSnapshot: (compiled: CompiledContext, shaped: ShapedContextMetadata) => void;
  resetContextSnapshot: () => void;
}

export const useUI = create<UIState>((set, get) => ({
  isCommandCenterOpen: false,
  contextSnapshot: undefined,
  openCommandCenter: () => set({ isCommandCenterOpen: true }),
  closeCommandCenter: () => set({ isCommandCenterOpen: false }),
  setContextSnapshot: (compiled, shaped) =>
    set({
      contextSnapshot: {
        phase: compiled.conversationPhase,
        continuity: compiled.continuityScore,
        emotionalTemperature: shaped.emotionalTemperature,
        safetyBias: shaped.safetyBias,
      },
    }),
  resetContextSnapshot: () => set({ contextSnapshot: undefined }),
}));
