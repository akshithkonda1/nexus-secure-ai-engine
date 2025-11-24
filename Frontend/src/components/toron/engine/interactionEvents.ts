import classifyIntent from "./intentClassifier";
import { derivePersona } from "./personaEngine";
import getToronState from "./stateMachine";
import buildAdaptiveResponse from "./adaptiveResponseEngine";
import {
  ToronAdaptiveMetadata,
  ToronInteractionContext,
  ToronInteractionEventPayload,
  ToronState,
  createDefaultToronContext,
} from "./types";

const buildContext = (
  payload: ToronInteractionEventPayload,
  prev: ToronInteractionContext,
  forcedState?: ToronState,
): ToronInteractionContext => {
  const classification = classifyIntent(payload.message, payload.backendMetadata);
  const persona = derivePersona(classification);
  const state = forcedState ?? getToronState(prev.state, classification, payload.backendMetadata);
  const metadata: ToronAdaptiveMetadata = buildAdaptiveResponse(
    persona,
    classification,
    state,
    payload.backendMetadata,
  );

  return {
    message: payload.message,
    classification,
    persona,
    state: metadata.state,
    metadata,
    backendMetadata: payload.backendMetadata,
  };
};

export const onUserTyping = (
  payload: ToronInteractionEventPayload,
  prev: ToronInteractionContext = createDefaultToronContext(),
): ToronInteractionContext => buildContext(payload, prev, "thinking");

export const onUserSubmit = (
  payload: ToronInteractionEventPayload,
  prev: ToronInteractionContext = createDefaultToronContext(),
): ToronInteractionContext => buildContext(payload, prev, "processing");

export const onToronThinking = (
  payload: ToronInteractionEventPayload,
  prev: ToronInteractionContext = createDefaultToronContext(),
): ToronInteractionContext => buildContext(payload, prev, "thinking");

export const onToronResponding = (
  payload: ToronInteractionEventPayload,
  prev: ToronInteractionContext = createDefaultToronContext(),
): ToronInteractionContext => buildContext(payload, prev, "responding");

export const onToronIdle = (
  payload: ToronInteractionEventPayload,
  prev: ToronInteractionContext = createDefaultToronContext(),
): ToronInteractionContext => buildContext(payload, prev, "idle");

export const onToronError = (
  payload: ToronInteractionEventPayload,
  prev: ToronInteractionContext = createDefaultToronContext(),
): ToronInteractionContext => buildContext(
  { ...payload, backendMetadata: { ...payload.backendMetadata, error: true } },
  prev,
  "error",
);

export default {
  onUserTyping,
  onUserSubmit,
  onToronThinking,
  onToronResponding,
  onToronIdle,
  onToronError,
};
