import { IntentClassification, ToronBackendMetadata, ToronState } from "./types";

const stateOrder: ToronState[] = ["idle", "thinking", "processing", "responding", "idle"];

export const getToronState = (
  prevState: ToronState,
  classification: IntentClassification,
  backendMetadata?: ToronBackendMetadata,
): ToronState => {
  if (backendMetadata?.error) return "error";

  const { complexity, urgency } = classification;
  const progressIndex = stateOrder.indexOf(prevState);
  const nextIndex = progressIndex >= 0 ? progressIndex + 1 : 1;
  let candidate = stateOrder[Math.min(nextIndex, stateOrder.length - 1)];

  if (prevState === "idle" && (complexity > 0.2 || urgency > 0.2)) {
    candidate = "thinking";
  }

  if (prevState === "thinking" && (complexity > 0.4 || backendMetadata?.activityLevel)) {
    candidate = "processing";
  }

  if (prevState === "processing" && (complexity > 0.3 || urgency > 0.3)) {
    candidate = "responding";
  }

  if (prevState === "responding" && urgency < 0.3 && complexity < 0.4) {
    candidate = "idle";
  }

  return candidate;
};

export default getToronState;
