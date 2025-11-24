export type ToronIntent =
  | "question"
  | "command"
  | "analysis"
  | "creative"
  | "emotional"
  | "technical"
  | "system"
  | "other";

export type ToronEmotion =
  | "neutral"
  | "positive"
  | "negative"
  | "confused"
  | "excited";

export interface IntentClassification {
  intent: ToronIntent;
  emotion: ToronEmotion;
  urgency: number; // normalized 0-1
  complexity: number; // normalized 0-1
  interrogativeDensity: number;
  imperativeDensity: number;
  emotionalDensity: number;
  technicalDensity: number;
  creativeDensity: number;
}

export type ToronPersona =
  | "direct"
  | "analytical"
  | "creative"
  | "empathetic"
  | "technical"
  | "neutral";

export interface PersonaProfile {
  persona: ToronPersona;
  tone: string;
  visualBias: {
    colorBoost: number; // 0-1
    waveformEnergy: number; // 0-1
    resonanceShift: number; // 0-1
  };
}

export type ToronState =
  | "idle"
  | "thinking"
  | "processing"
  | "responding"
  | "error";

export interface ToronBackendMetadata {
  error?: boolean;
  complexityHint?: number; // 0-1
  activityLevel?: number; // 0-1
  lastLatencyMs?: number;
}

export interface ToronAdaptiveMetadata {
  sentiment: number; // -1 to 1
  confidence: number; // 0-1
  biasScore: number; // 0-1
  hallucinationRisk: number; // 0-1
  complexity: number; // 0-1
  state: ToronState;
  llmAgreement: number; // 0-1
}

export interface ToronInteractionContext {
  message: string;
  classification: IntentClassification;
  persona: PersonaProfile;
  state: ToronState;
  metadata: ToronAdaptiveMetadata;
  backendMetadata?: ToronBackendMetadata;
}

export interface ToronInteractionEventPayload {
  message: string;
  backendMetadata?: ToronBackendMetadata;
}

export const clamp = (value: number, min = 0, max = 1): number => {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
};

export const createDefaultToronContext = (): ToronInteractionContext => ({
  message: "",
  classification: {
    intent: "other",
    emotion: "neutral",
    urgency: 0,
    complexity: 0,
    interrogativeDensity: 0,
    imperativeDensity: 0,
    emotionalDensity: 0,
    technicalDensity: 0,
    creativeDensity: 0,
  },
  persona: {
    persona: "neutral",
    tone: "grounded",
    visualBias: {
      colorBoost: 0.2,
      waveformEnergy: 0.2,
      resonanceShift: 0.2,
    },
  },
  state: "idle",
  metadata: {
    sentiment: 0,
    confidence: 0.5,
    biasScore: 0.2,
    hallucinationRisk: 0.2,
    complexity: 0,
    state: "idle",
    llmAgreement: 0.7,
  },
});
