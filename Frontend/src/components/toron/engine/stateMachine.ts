import { CompiledContext, IntentClassification, ToronState } from "../context/types";

export const initialState: ToronState = {
  stage: "exploration",
  stability: 0.6,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const updateState = (
  current: ToronState,
  intent: IntentClassification,
  compiled: CompiledContext
): ToronState => {
  let stage = current.stage;

  const canAdvance = compiled.difficultyScore < 0.75;

  if (canAdvance) {
    if (intent.intent === "planning" || intent.intent === "analysis") {
      stage = "analysis";
    } else if (intent.intent === "support" || intent.intent === "resolution") {
      stage = "resolution";
    } else {
      stage = compiled.conversationPhase;
    }
  }

  const stability = clamp(
    current.stability * 0.9 + (1 - compiled.difficultyScore) * 0.3,
    0,
    1
  );

  return {
    stage,
    stability,
    lastIntent: intent.intent,
  };
};
