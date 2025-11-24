import {
  CompiledContext,
  ContextWindowEntry,
  IntentClassification,
  PersonaProfile,
  ToronState,
} from "./types";

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const buildSemanticContext = (
  windowEntries: ContextWindowEntry[],
  persona: PersonaProfile,
  state: ToronState,
  classification: IntentClassification
): string => {
  const distilled = windowEntries
    .slice(-8)
    .map((entry) => `${entry.role}:${entry.intent}:${entry.summary}`)
    .join(" | ");

  const personaHint = `${persona.tone} persona`; // safe, no user data
  const stateHint = `phase-${state.stage}`;
  const semantic = `${personaHint}; ${stateHint}; intent:${classification.intent}; ${distilled}`;

  return semantic.slice(0, 300);
};

export const compileContext = (
  windowEntries: ContextWindowEntry[],
  persona: PersonaProfile,
  state: ToronState,
  classification: IntentClassification
): CompiledContext => {
  const semanticContext = buildSemanticContext(
    windowEntries,
    persona,
    state,
    classification
  );

  const continuityScore = clamp(windowEntries.length / 25, 0, 1);
  const complexity = windowEntries.reduce((acc, entry) => acc + entry.meaningVector.length, 0);
  const difficultyScore = clamp(
    (complexity / (windowEntries.length || 1)) * 0.05 + classification.confidence * 0.3,
    0,
    1
  );

  const conversationPhase = state.stage;

  return {
    semanticContext,
    conversationPhase,
    difficultyScore,
    continuityScore,
  };
};
