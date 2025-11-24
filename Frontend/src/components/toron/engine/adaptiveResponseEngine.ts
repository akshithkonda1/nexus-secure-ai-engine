import {
  IntentClassification,
  PersonaProfile,
  ToronAdaptiveMetadata,
  ToronBackendMetadata,
  ToronState,
  clamp,
} from "./types";

const baseSentimentFromEmotion = (emotion: string): number => {
  switch (emotion) {
    case "positive":
      return 0.6;
    case "negative":
      return -0.5;
    case "confused":
      return -0.1;
    case "excited":
      return 0.4;
    default:
      return 0;
  }
};

const baseConfidenceFromIntent = (intent: string, complexity: number): number => {
  const base = intent === "technical" || intent === "analysis" ? 0.65 : 0.55;
  return clamp(base + complexity * 0.2);
};

export const buildAdaptiveResponse = (
  persona: PersonaProfile,
  classification: IntentClassification,
  prevState: ToronState,
  backendMetadata?: ToronBackendMetadata,
): ToronAdaptiveMetadata => {
  const sentiment = clamp(
    baseSentimentFromEmotion(classification.emotion) +
      (persona.persona === "empathetic" ? 0.1 : 0) -
      (persona.persona === "technical" ? 0.05 : 0),
    -1,
    1,
  );

  let confidence = baseConfidenceFromIntent(classification.intent, classification.complexity);
  let hallucinationRisk = clamp(0.2 + classification.creativeDensity * 0.5);
  let biasScore = clamp(0.2 + persona.visualBias.colorBoost * 0.3);
  let complexity = clamp((classification.complexity + classification.technicalDensity) / 1.6);
  let llmAgreement = clamp(1 - hallucinationRisk * 0.4 + persona.visualBias.waveformEnergy * 0.1);
  let state: ToronState = prevState;

  if (persona.persona === "technical") {
    confidence = clamp(confidence + 0.2);
    complexity = clamp(complexity + 0.15);
  }

  if (persona.persona === "empathetic") {
    confidence = clamp(confidence - 0.05);
    biasScore = clamp(biasScore + 0.1);
  }

  if (persona.persona === "analytical") {
    confidence = clamp(confidence + 0.1);
    hallucinationRisk = clamp(hallucinationRisk - 0.05);
  }

  if (classification.intent === "emotional") {
    hallucinationRisk = clamp(hallucinationRisk + 0.1);
  }

  if (backendMetadata?.error) {
    state = "error";
    confidence = clamp(confidence * 0.3);
  }

  if (backendMetadata?.activityLevel && state !== "error") {
    const activity = clamp(backendMetadata.activityLevel);
    llmAgreement = clamp(llmAgreement + activity * 0.1);
  }

  return {
    sentiment,
    confidence,
    biasScore,
    hallucinationRisk,
    complexity,
    state,
    llmAgreement,
  };
};

export default buildAdaptiveResponse;
