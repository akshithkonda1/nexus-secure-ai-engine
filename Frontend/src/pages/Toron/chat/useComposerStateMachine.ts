import { useCallback, useMemo, useReducer } from "react";

import type { ToronAttachment } from "@/state/toron/toronSessionTypes";

export type ComposerState =
  | "idle"
  | "typing"
  | "attachments_ready"
  | "listening"
  | "sending"
  | "responding"
  | "error";

interface ComposerContext {
  status: ComposerState;
  hasText: boolean;
  hasAttachments: boolean;
  error?: string | null;
}

type ComposerAction =
  | { type: "SET_INPUTS"; payload: { hasText: boolean; hasAttachments: boolean } }
  | { type: "START_LISTENING" }
  | { type: "STOP_LISTENING" }
  | { type: "START_SENDING" }
  | { type: "START_RESPONDING" }
  | { type: "SET_ERROR"; payload?: string }
  | { type: "RESET" };

const reducer = (state: ComposerContext, action: ComposerAction): ComposerContext => {
  switch (action.type) {
    case "SET_INPUTS": {
      if (state.status === "sending" || state.status === "responding") {
        return { ...state, hasText: action.payload.hasText, hasAttachments: action.payload.hasAttachments };
      }
      if (state.status === "listening") {
        return { ...state, hasText: action.payload.hasText, hasAttachments: action.payload.hasAttachments };
      }
      const status = action.payload.hasText
        ? "typing"
        : action.payload.hasAttachments
          ? "attachments_ready"
          : "idle";
      return { ...state, ...action.payload, status, error: null };
    }
    case "START_LISTENING":
      return { ...state, status: "listening", error: null };
    case "STOP_LISTENING": {
      if (state.hasText) return { ...state, status: "typing" };
      if (state.hasAttachments) return { ...state, status: "attachments_ready" };
      return { ...state, status: "idle" };
    }
    case "START_SENDING":
      return { ...state, status: "sending", error: null };
    case "START_RESPONDING":
      return { ...state, status: "responding", error: null };
    case "SET_ERROR":
      return { ...state, status: "error", error: action.payload ?? "Unknown error" };
    case "RESET":
      return { status: "idle", hasText: false, hasAttachments: false, error: null };
    default:
      return state;
  }
};

export const useComposerStateMachine = () => {
  const [state, dispatch] = useReducer(reducer, {
    status: "idle" as ComposerState,
    hasText: false,
    hasAttachments: false,
    error: null,
  });

  const updateInputs = useCallback((value: string, attachments: ToronAttachment[]) => {
    dispatch({
      type: "SET_INPUTS",
      payload: { hasText: value.trim().length > 0, hasAttachments: attachments.length > 0 },
    });
  }, []);

  const startListening = useCallback(() => dispatch({ type: "START_LISTENING" }), []);
  const stopListening = useCallback(() => dispatch({ type: "STOP_LISTENING" }), []);
  const startSending = useCallback(() => dispatch({ type: "START_SENDING" }), []);
  const startResponding = useCallback(() => dispatch({ type: "START_RESPONDING" }), []);
  const setError = useCallback((error?: string) => dispatch({ type: "SET_ERROR", payload: error }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const canSend = useMemo(
    () =>
      (state.hasText || state.hasAttachments) &&
      state.status !== "sending" &&
      state.status !== "responding" &&
      state.status !== "listening",
    [state.hasAttachments, state.hasText, state.status],
  );

  return {
    state,
    canSend,
    updateInputs,
    startListening,
    stopListening,
    startSending,
    startResponding,
    setError,
    reset,
  };
};

export type ComposerStateApi = ReturnType<typeof useComposerStateMachine>;
